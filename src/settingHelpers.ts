import { App, normalizePath, Setting, TFile, TFolder } from 'obsidian';

import type { KanbanSettings, SettingsManager } from './Settings';
import { getTemplatePlugins } from './components/helpers';
import { t } from './lang/helpers';

export const defaultDateTrigger = '@';
export const defaultTimeTrigger = '@@';
export const defaultMetadataPosition = 'body';

export type PathSettingKind = 'file' | 'folder';

export interface PathValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

export function getTemplateWarning(app: App) {
  const { templatesEnabled, templaterPlugin } = getTemplatePlugins(app);

  if (!templatesEnabled && !templaterPlugin) {
    return t('Note: No template plugins are currently enabled.');
  }

  return '';
}

export function validatePathSetting(
  app: App,
  rawValue: string,
  kind: PathSettingKind
): PathValidationResult {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return { valid: true, normalized: '' };
  }

  const normalized = normalizePath(trimmed);
  const entry = app.vault.getAbstractFileByPath(normalized);
  const valid = kind === 'file' ? entry instanceof TFile : entry instanceof TFolder;

  if (valid) {
    return { valid: true, normalized };
  }

  return {
    valid: false,
    normalized,
    error:
      kind === 'file'
        ? t('Path must point to an existing file.')
        : t('Path must point to an existing folder.'),
  };
}

interface CreatePathInputParams {
  app: App;
  key: keyof KanbanSettings;
  kind: PathSettingKind;
  warningText?: string;
  local: boolean;
  placeHolderStr: string;
  manager: SettingsManager;
}

export function createPathInput({
  app,
  key,
  kind,
  warningText,
  local,
  placeHolderStr,
  manager,
}: CreatePathInputParams) {
  return (setting: Setting) => {
    if (warningText) {
      setting.descEl.createDiv({}, (div) => {
        div.createEl('strong', { text: warningText });
      });
    }

    const errorEl = setting.descEl.createDiv({ cls: 'kanban-plugin__setting-error' });
    errorEl.hide();

    setting.addText((text) => {
      const [value, globalValue] = manager.getSetting(key, local);
      const inheritedPlaceholder =
        typeof globalValue === 'string' && globalValue
          ? `${globalValue} (${t('default')})`
          : placeHolderStr;

      text.setPlaceholder(inheritedPlaceholder);
      text.setValue(typeof value === 'string' ? value : '');

      text.onChange((rawValue) => {
        const result = validatePathSetting(app, rawValue, kind);

        if (!result.valid) {
          text.inputEl.addClass('error');
          text.inputEl.setAttr('aria-invalid', 'true');
          errorEl.setText(result.error ?? '');
          errorEl.show();
          return;
        }

        text.inputEl.removeClass('error');
        text.inputEl.removeAttribute('aria-invalid');
        errorEl.setText('');
        errorEl.hide();

        if (result.normalized) {
          manager.applySettingsUpdate({
            [key]: {
              $set: result.normalized,
            },
          });
        } else {
          manager.applySettingsUpdate({
            $unset: [key],
          });
        }
      });
    });
  };
}
