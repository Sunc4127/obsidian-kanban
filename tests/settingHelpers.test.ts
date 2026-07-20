import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TFile as MockTFile, TFolder as MockTFolder } from './mocks/obsidian';

vi.mock('../src/components/helpers', () => ({
  getTemplatePlugins: () => ({
    templateFolder: '',
    templatesEnabled: true,
    templaterPlugin: null,
  }),
}));

vi.mock('../src/lang/helpers', () => ({
  t: (value: string) => value,
}));

import { createPathInput, validatePathSetting } from '../src/settingHelpers';

class FakeDescription {
  text = '';
  visible = true;

  createDiv(_options?: unknown, callback?: (div: FakeDescription) => void) {
    const child = new FakeDescription();
    callback?.(child);
    return child;
  }

  createEl(_tag: string, options: { text?: string }) {
    this.text = options.text ?? '';
  }

  hide() {
    this.visible = false;
  }

  show() {
    this.visible = true;
  }

  setText(value: string) {
    this.text = value;
  }
}

class FakeInputElement {
  classes = new Set<string>();
  attributes = new Map<string, string>();

  addClass(value: string) {
    this.classes.add(value);
  }

  removeClass(value: string) {
    this.classes.delete(value);
  }

  setAttr(name: string, value: string) {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
}

class FakeTextComponent {
  inputEl = new FakeInputElement();
  placeholder = '';
  value = '';
  changeHandler: (value: string) => void = () => undefined;

  setPlaceholder(value: string) {
    this.placeholder = value;
    return this;
  }

  setValue(value: string) {
    this.value = value;
    return this;
  }

  onChange(handler: (value: string) => void) {
    this.changeHandler = handler;
    return this;
  }
}

class FakeSetting {
  descEl = new FakeDescription();
  text = new FakeTextComponent();

  addText(callback: (text: FakeTextComponent) => void) {
    callback(this.text);
    return this;
  }
}

function createFixture() {
  const entries = new Map<string, MockTFile | MockTFolder>([
    ['模板/周 报.md', new MockTFile('模板/周 报.md')],
    ['项目/中文 看板', new MockTFolder('项目/中文 看板')],
  ]);
  const recurseChildren = vi.fn();
  const app = {
    vault: {
      getAbstractFileByPath: (path: string) => entries.get(path) ?? null,
      recurseChildren,
    },
  };

  return { app, recurseChildren };
}

describe('validatePathSetting', () => {
  it('normalizes and accepts existing CJK paths containing spaces', () => {
    const { app } = createFixture();

    expect(validatePathSetting(app as never, '  模板//周 报.md  ', 'file')).toEqual({
      valid: true,
      normalized: '模板/周 报.md',
    });
    expect(validatePathSetting(app as never, '项目/中文 看板', 'folder')).toEqual({
      valid: true,
      normalized: '项目/中文 看板',
    });
  });

  it('rejects missing paths and paths of the wrong kind', () => {
    const { app } = createFixture();

    expect(validatePathSetting(app as never, '不存在.md', 'file').valid).toBe(false);
    expect(validatePathSetting(app as never, '模板/周 报.md', 'folder').valid).toBe(false);
  });

  it('treats blank input as a valid request to unset the override', () => {
    const { app } = createFixture();

    expect(validatePathSetting(app as never, '   ', 'folder')).toEqual({
      valid: true,
      normalized: '',
    });
  });
});

describe('createPathInput', () => {
  let applySettingsUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    applySettingsUpdate = vi.fn();
  });

  it('constructs global and local controls without recursively scanning the vault', () => {
    const { app, recurseChildren } = createFixture();
    const globalSetting = new FakeSetting();
    const localSetting = new FakeSetting();

    createPathInput({
      app: app as never,
      key: 'new-note-template',
      kind: 'file',
      local: false,
      placeHolderStr: 'No template',
      manager: {
        getSetting: () => ['模板/周 报.md', null],
        applySettingsUpdate,
      } as never,
    })(globalSetting as never);

    createPathInput({
      app: app as never,
      key: 'new-note-folder',
      kind: 'folder',
      local: true,
      placeHolderStr: 'Default folder',
      manager: {
        getSetting: () => [undefined, '项目/中文 看板'],
        applySettingsUpdate,
      } as never,
    })(localSetting as never);

    expect(recurseChildren).not.toHaveBeenCalled();
    expect(globalSetting.text.value).toBe('模板/周 报.md');
    expect(localSetting.text.value).toBe('');
    expect(localSetting.text.placeholder).toBe('项目/中文 看板 (default)');
  });

  it('persists normalized valid paths and unsets blank values', () => {
    const { app } = createFixture();
    const setting = new FakeSetting();

    createPathInput({
      app: app as never,
      key: 'new-note-template',
      kind: 'file',
      local: true,
      placeHolderStr: 'No template',
      manager: {
        getSetting: () => [undefined, undefined],
        applySettingsUpdate,
      } as never,
    })(setting as never);

    setting.text.changeHandler('模板//周 报.md');
    expect(applySettingsUpdate).toHaveBeenLastCalledWith({
      'new-note-template': { $set: '模板/周 报.md' },
    });

    setting.text.changeHandler('');
    expect(applySettingsUpdate).toHaveBeenLastCalledWith({
      $unset: ['new-note-template'],
    });
  });

  it('shows an inline error and does not persist invalid paths', () => {
    const { app } = createFixture();
    const setting = new FakeSetting();

    createPathInput({
      app: app as never,
      key: 'new-note-folder',
      kind: 'folder',
      local: false,
      placeHolderStr: 'Default folder',
      manager: {
        getSetting: () => [undefined, null],
        applySettingsUpdate,
      } as never,
    })(setting as never);

    setting.text.changeHandler('不存在/目录');

    expect(applySettingsUpdate).not.toHaveBeenCalled();
    expect(setting.text.inputEl.classes.has('error')).toBe(true);
    expect(setting.text.inputEl.attributes.get('aria-invalid')).toBe('true');
  });

  it('does not replace a previously accepted update when later text is invalid', () => {
    const { app } = createFixture();
    const setting = new FakeSetting();

    createPathInput({
      app: app as never,
      key: 'new-note-folder',
      kind: 'folder',
      local: false,
      placeHolderStr: 'Default folder',
      manager: {
        getSetting: () => [undefined, null],
        applySettingsUpdate,
      } as never,
    })(setting as never);

    setting.text.changeHandler('项目/中文 看板');
    setting.text.changeHandler('项目/不存在');

    expect(applySettingsUpdate).toHaveBeenCalledTimes(1);
    expect(applySettingsUpdate).toHaveBeenCalledWith({
      'new-note-folder': { $set: '项目/中文 看板' },
    });
  });
});
