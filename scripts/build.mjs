import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { midnight, frost } from './palettes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Append a 2-digit hex alpha to a #rrggbb colour.
const a = (hex, alpha) => hex.slice(0, 7) + alpha;

function workbench(p) {
  const dark = p.type === 'dark';
  return {
    // base
    focusBorder: a(p.accent, '80'),
    foreground: p.fg,
    descriptionForeground: p.fgMuted,
    errorForeground: p.red,
    'icon.foreground': p.fgMuted,
    'widget.shadow': dark ? '#00000066' : '#3b2f1a22',
    'selection.background': p.selection,
    'sash.hoverBorder': a(p.accent, '99'),

    'textLink.foreground': p.frost,
    'textLink.activeForeground': p.gold,
    'textBlockQuote.background': p.bgAlt,
    'textBlockQuote.border': p.green,
    'textCodeBlock.background': p.bgAlt,
    'textPreformat.foreground': p.green,
    'textSeparator.foreground': p.borderStrong,

    // buttons and inputs
    'button.background': p.buttonBg,
    'button.foreground': p.buttonFg,
    'button.hoverBackground': p.buttonHover,
    'button.secondaryBackground': p.bgHover,
    'button.secondaryForeground': p.fg,
    'button.secondaryHoverBackground': p.borderStrong,
    'button.separator': a(p.buttonFg, '44'),
    'dropdown.background': p.bgInput,
    'dropdown.listBackground': p.bgWidget,
    'dropdown.border': p.borderStrong,
    'dropdown.foreground': p.fg,
    'input.background': p.bgInput,
    'input.border': p.borderStrong,
    'input.foreground': p.fg,
    'input.placeholderForeground': p.fgSubtle,
    'inputOption.activeBackground': a(p.accent, '33'),
    'inputOption.activeBorder': a(p.accent, '99'),
    'inputOption.activeForeground': p.fg,
    'inputValidation.errorBackground': p.bgWidget,
    'inputValidation.errorBorder': p.red,
    'inputValidation.warningBackground': p.bgWidget,
    'inputValidation.warningBorder': p.gold,
    'inputValidation.infoBackground': p.bgWidget,
    'inputValidation.infoBorder': p.frost,
    'checkbox.background': p.bgInput,
    'checkbox.border': p.borderStrong,
    'checkbox.foreground': p.fg,
    'badge.background': p.badgeBg,
    'badge.foreground': p.badgeFg,
    'progressBar.background': p.accent,
    'keybindingLabel.background': p.bgHover,
    'keybindingLabel.foreground': p.fg,
    'keybindingLabel.border': p.borderStrong,
    'keybindingLabel.bottomBorder': p.borderStrong,

    // scrollbars
    'scrollbar.shadow': dark ? '#00000088' : '#3b2f1a1a',
    'scrollbarSlider.background': a(p.fgSubtle, '33'),
    'scrollbarSlider.hoverBackground': a(p.fgSubtle, '55'),
    'scrollbarSlider.activeBackground': a(p.fgSubtle, '77'),

    // lists and trees
    'list.activeSelectionBackground': dark ? '#24403599' : '#dfeadf',
    'list.activeSelectionForeground': p.fg,
    'list.activeSelectionIconForeground': p.fg,
    'list.inactiveSelectionBackground': dark ? '#1c312966' : '#e8eee4',
    'list.inactiveSelectionForeground': p.fg,
    'list.hoverBackground': p.bgHover,
    'list.hoverForeground': p.fg,
    'list.focusBackground': dark ? '#24403599' : '#dfeadf',
    'list.focusOutline': a(p.accent, '80'),
    'list.highlightForeground': p.gold,
    'list.focusHighlightForeground': p.gold,
    'list.errorForeground': p.red,
    'list.warningForeground': p.gold,
    'list.dropBackground': a(p.green, '22'),
    'list.deemphasizedForeground': p.fgSubtle,
    'tree.indentGuidesStroke': p.borderStrong,
    'tree.inactiveIndentGuidesStroke': p.border,

    // activity bar
    'activityBar.background': p.bgDeep,
    'activityBar.foreground': p.fg,
    'activityBar.inactiveForeground': p.fgSubtle,
    'activityBar.border': p.border,
    'activityBar.activeBorder': p.accent,
    'activityBar.activeBackground': a(p.accent, '14'),
    'activityBarBadge.background': p.badgeBg,
    'activityBarBadge.foreground': p.badgeFg,

    // side bar
    'sideBar.background': p.bgAlt,
    'sideBar.foreground': p.fgMuted,
    'sideBar.border': p.border,
    'sideBarTitle.foreground': p.fg,
    'sideBarSectionHeader.background': p.bgAlt,
    'sideBarSectionHeader.foreground': p.fg,
    'sideBarSectionHeader.border': p.border,

    // title bar, menus, command centre
    'titleBar.activeBackground': p.bgDeep,
    'titleBar.activeForeground': p.fg,
    'titleBar.inactiveBackground': p.bgDeep,
    'titleBar.inactiveForeground': p.fgSubtle,
    'titleBar.border': p.border,
    'menubar.selectionBackground': p.bgHover,
    'menubar.selectionForeground': p.fg,
    'menu.background': p.bgWidget,
    'menu.foreground': p.fg,
    'menu.selectionBackground': dark ? '#24403599' : '#dfeadf',
    'menu.selectionForeground': p.fg,
    'menu.separatorBackground': p.border,
    'menu.border': p.border,
    'commandCenter.background': p.bgAlt,
    'commandCenter.foreground': p.fgMuted,
    'commandCenter.activeBackground': p.bgHover,
    'commandCenter.border': p.border,
    'quickInput.background': p.bgWidget,
    'quickInput.foreground': p.fg,
    'quickInputList.focusBackground': dark ? '#24403599' : '#dfeadf',
    'quickInputTitle.background': p.bgAlt,
    'pickerGroup.foreground': p.gold,
    'pickerGroup.border': p.border,

    // tabs and breadcrumbs
    'editorGroup.border': p.border,
    'editorGroup.dropBackground': a(p.green, '1a'),
    'editorGroupHeader.tabsBackground': p.bgAlt,
    'editorGroupHeader.tabsBorder': p.border,
    'editorGroupHeader.noTabsBackground': p.bg,
    'tab.activeBackground': p.bg,
    'tab.activeForeground': p.fg,
    'tab.activeBorderTop': p.accent,
    'tab.activeBorder': p.bg,
    'tab.inactiveBackground': p.bgAlt,
    'tab.inactiveForeground': p.fgSubtle,
    'tab.hoverBackground': p.bgHover,
    'tab.hoverForeground': p.fg,
    'tab.border': p.border,
    'tab.unfocusedActiveForeground': p.fgMuted,
    'tab.unfocusedActiveBorderTop': a(p.accent, '55'),
    'tab.unfocusedInactiveForeground': p.fgSubtle,
    'tab.activeModifiedBorder': p.gold,
    'tab.inactiveModifiedBorder': a(p.gold, '88'),
    'breadcrumb.foreground': p.fgSubtle,
    'breadcrumb.focusForeground': p.fg,
    'breadcrumb.activeSelectionForeground': p.gold,
    'breadcrumb.background': p.bg,
    'breadcrumbPicker.background': p.bgWidget,

    // editor
    'editor.background': p.bg,
    'editor.foreground': p.fg,
    'editorLineNumber.foreground': p.lineNumber,
    'editorLineNumber.activeForeground': p.lineNumberActive,
    'editorCursor.foreground': p.cursor,
    'editor.selectionBackground': p.selection,
    'editor.inactiveSelectionBackground': p.selectionInactive,
    'editor.selectionHighlightBackground': a(p.green, '22'),
    'editor.selectionHighlightBorder': a(p.green, '44'),
    'editor.wordHighlightBackground': a(p.frost, '22'),
    'editor.wordHighlightStrongBackground': a(p.gold, '26'),
    'editor.findMatchBackground': a(p.gold, '55'),
    'editor.findMatchBorder': p.gold,
    'editor.findMatchHighlightBackground': a(p.gold, '26'),
    'editor.findRangeHighlightBackground': a(p.frost, '14'),
    'editor.hoverHighlightBackground': a(p.frost, '1a'),
    'editor.lineHighlightBackground': p.bgHover,
    'editor.lineHighlightBorder': '#00000000',
    'editor.rangeHighlightBackground': a(p.gold, '14'),
    'editor.foldBackground': a(p.green, '0f'),
    'editorLink.activeForeground': p.frost,
    'editorWhitespace.foreground': a(p.fgSubtle, '55'),
    'editorIndentGuide.background1': p.border,
    'editorIndentGuide.activeBackground1': p.borderStrong,
    'editorRuler.foreground': p.border,
    'editorCodeLens.foreground': p.fgSubtle,
    'editorBracketMatch.background': a(p.gold, '22'),
    'editorBracketMatch.border': a(p.gold, '88'),
    // Bracket pairs light up like a string of Christmas lights.
    'editorBracketHighlight.foreground1': p.gold,
    'editorBracketHighlight.foreground2': p.red,
    'editorBracketHighlight.foreground3': p.green,
    'editorBracketHighlight.foreground4': p.frost,
    'editorBracketHighlight.foreground5': p.candy,
    'editorBracketHighlight.foreground6': p.plum,
    'editorBracketHighlight.unexpectedBracket.foreground': p.red,
    'editorBracketPairGuide.activeBackground1': a(p.gold, '66'),
    'editorBracketPairGuide.activeBackground2': a(p.red, '66'),
    'editorBracketPairGuide.activeBackground3': a(p.green, '66'),
    'editorBracketPairGuide.activeBackground4': a(p.frost, '66'),
    'editorBracketPairGuide.activeBackground5': a(p.candy, '66'),
    'editorBracketPairGuide.activeBackground6': a(p.plum, '66'),
    'editorError.foreground': p.red,
    'editorWarning.foreground': p.gold,
    'editorInfo.foreground': p.frost,
    'editorHint.foreground': p.green,
    'editorUnnecessaryCode.opacity': '#00000088',
    'editorGutter.background': p.bg,
    'editorGutter.addedBackground': a(p.green, 'bb'),
    'editorGutter.modifiedBackground': a(p.gold, 'bb'),
    'editorGutter.deletedBackground': a(p.red, 'bb'),
    'editorGutter.foldingControlForeground': p.fgSubtle,
    'editorInlayHint.background': a(p.fgSubtle, '1f'),
    'editorInlayHint.foreground': p.fgSubtle,
    'editorStickyScroll.background': p.bg,
    'editorStickyScroll.shadow': dark ? '#00000088' : '#3b2f1a1a',
    'editorStickyScrollHover.background': p.bgHover,
    'editorGhostText.foreground': a(p.fgSubtle, 'cc'),

    // overview ruler and minimap
    'editorOverviewRuler.border': p.border,
    'editorOverviewRuler.findMatchForeground': a(p.gold, 'aa'),
    'editorOverviewRuler.selectionHighlightForeground': a(p.green, '88'),
    'editorOverviewRuler.errorForeground': p.red,
    'editorOverviewRuler.warningForeground': p.gold,
    'editorOverviewRuler.infoForeground': p.frost,
    'editorOverviewRuler.addedForeground': a(p.green, '99'),
    'editorOverviewRuler.modifiedForeground': a(p.gold, '99'),
    'editorOverviewRuler.deletedForeground': a(p.red, '99'),
    'minimap.selectionHighlight': a(p.green, '66'),
    'minimap.findMatchHighlight': a(p.gold, '88'),
    'minimap.errorHighlight': a(p.red, 'aa'),
    'minimap.warningHighlight': a(p.gold, 'aa'),
    'minimapGutter.addedBackground': p.green,
    'minimapGutter.modifiedBackground': p.gold,
    'minimapGutter.deletedBackground': p.red,

    // diff and merge
    'diffEditor.insertedTextBackground': a(p.green, '26'),
    'diffEditor.removedTextBackground': a(p.red, '26'),
    'diffEditor.insertedLineBackground': a(p.green, '14'),
    'diffEditor.removedLineBackground': a(p.red, '14'),
    'diffEditor.diagonalFill': p.border,
    'merge.currentHeaderBackground': a(p.green, '55'),
    'merge.currentContentBackground': a(p.green, '1f'),
    'merge.incomingHeaderBackground': a(p.frost, '55'),
    'merge.incomingContentBackground': a(p.frost, '1f'),
    'merge.commonHeaderBackground': a(p.fgSubtle, '55'),
    'merge.commonContentBackground': a(p.fgSubtle, '1f'),

    // widgets
    'editorWidget.background': p.bgWidget,
    'editorWidget.foreground': p.fg,
    'editorWidget.border': p.borderStrong,
    'editorSuggestWidget.background': p.bgWidget,
    'editorSuggestWidget.border': p.borderStrong,
    'editorSuggestWidget.foreground': p.fg,
    'editorSuggestWidget.highlightForeground': p.gold,
    'editorSuggestWidget.focusHighlightForeground': p.gold,
    'editorSuggestWidget.selectedBackground': dark ? '#24403599' : '#dfeadf',
    'editorHoverWidget.background': p.bgWidget,
    'editorHoverWidget.border': p.borderStrong,
    'editorMarkerNavigation.background': p.bgWidget,
    'peekView.border': p.accent,
    'peekViewEditor.background': p.bgAlt,
    'peekViewEditor.matchHighlightBackground': a(p.gold, '33'),
    'peekViewResult.background': p.bgAlt,
    'peekViewResult.matchHighlightBackground': a(p.gold, '33'),
    'peekViewResult.selectionBackground': p.bgHover,
    'peekViewTitle.background': p.bgDeep,
    'peekViewTitleLabel.foreground': p.fg,
    'peekViewTitleDescription.foreground': p.fgMuted,

    // panel and terminal
    'panel.background': p.bg,
    'panel.border': p.border,
    'panelTitle.activeBorder': p.accent,
    'panelTitle.activeForeground': p.fg,
    'panelTitle.inactiveForeground': p.fgSubtle,
    'panelInput.border': p.borderStrong,
    'terminal.background': p.bg,
    'terminal.foreground': p.fg,
    'terminal.selectionBackground': p.selection,
    'terminalCursor.foreground': p.cursor,
    'terminal.ansiBlack': p.ansi.black,
    'terminal.ansiRed': p.ansi.red,
    'terminal.ansiGreen': p.ansi.green,
    'terminal.ansiYellow': p.ansi.yellow,
    'terminal.ansiBlue': p.ansi.blue,
    'terminal.ansiMagenta': p.ansi.magenta,
    'terminal.ansiCyan': p.ansi.cyan,
    'terminal.ansiWhite': p.ansi.white,
    'terminal.ansiBrightBlack': p.ansi.brightBlack,
    'terminal.ansiBrightRed': p.ansi.brightRed,
    'terminal.ansiBrightGreen': p.ansi.brightGreen,
    'terminal.ansiBrightYellow': p.ansi.brightYellow,
    'terminal.ansiBrightBlue': p.ansi.brightBlue,
    'terminal.ansiBrightMagenta': p.ansi.brightMagenta,
    'terminal.ansiBrightCyan': p.ansi.brightCyan,
    'terminal.ansiBrightWhite': p.ansi.brightWhite,

    // status bar
    'statusBar.background': p.statusBg,
    'statusBar.foreground': p.statusFg,
    'statusBar.border': p.statusBg,
    'statusBar.noFolderBackground': p.bgDeep,
    'statusBar.noFolderForeground': p.fgMuted,
    'statusBar.debuggingBackground': dark ? '#c25a1f' : '#c2410c',
    'statusBar.debuggingForeground': '#ffffff',
    'statusBarItem.hoverBackground': '#ffffff22',
    'statusBarItem.activeBackground': '#ffffff33',
    'statusBarItem.remoteBackground': dark ? '#7a1020' : '#244a3a',
    'statusBarItem.remoteForeground': p.statusFg,
    'statusBarItem.prominentBackground': '#00000033',
    'statusBarItem.errorBackground': dark ? '#7a1020' : '#9c1328',
    'statusBarItem.errorForeground': '#ffffff',

    // notifications
    'notifications.background': p.bgWidget,
    'notifications.foreground': p.fg,
    'notifications.border': p.border,
    'notificationCenterHeader.background': p.bgAlt,
    'notificationCenterHeader.foreground': p.fg,
    'notificationLink.foreground': p.frost,
    'notificationsErrorIcon.foreground': p.red,
    'notificationsWarningIcon.foreground': p.gold,
    'notificationsInfoIcon.foreground': p.frost,

    // git decorations
    'gitDecoration.addedResourceForeground': p.green,
    'gitDecoration.modifiedResourceForeground': p.gold,
    'gitDecoration.deletedResourceForeground': p.red,
    'gitDecoration.renamedResourceForeground': p.mint,
    'gitDecoration.untrackedResourceForeground': p.frost,
    'gitDecoration.ignoredResourceForeground': p.fgSubtle,
    'gitDecoration.conflictingResourceForeground': p.ember,
    'gitDecoration.stageModifiedResourceForeground': p.gold,
    'gitDecoration.stageDeletedResourceForeground': p.red,
    'gitDecoration.submoduleResourceForeground': p.plum,

    // misc
    'debugToolBar.background': p.bgWidget,
    'debugIcon.breakpointForeground': p.red,
    'debugIcon.startForeground': p.green,
    'editor.stackFrameHighlightBackground': a(p.gold, '22'),
    'editor.focusedStackFrameHighlightBackground': a(p.green, '22'),
    'settings.headerForeground': p.fg,
    'settings.modifiedItemIndicator': p.gold,
    'settings.focusedRowBackground': a(p.fgSubtle, '14'),
    'welcomePage.tileBackground': p.bgAlt,
    'welcomePage.tileHoverBackground': p.bgHover,
    'walkThrough.embeddedEditorBackground': p.bgAlt,
    'charts.foreground': p.fg,
    'charts.lines': p.fgSubtle,
    'charts.red': p.red,
    'charts.green': p.green,
    'charts.yellow': p.gold,
    'charts.blue': p.frost,
    'charts.purple': p.plum,
    'charts.orange': p.ember,
  };
}

function tokens(p) {
  const t = (name, scope, foreground, fontStyle) => ({
    name,
    scope,
    settings: fontStyle ? { foreground, fontStyle } : { foreground },
  });
  return [
    t('Comments', ['comment', 'punctuation.definition.comment', 'string.comment'], p.comment, 'italic'),
    t('Doc comment tags', ['comment.block.documentation storage.type.class', 'comment.block.documentation entity.name.type', 'storage.type.class.jsdoc', 'storage.type.class.doxygen'], p.ember, 'italic'),
    t('Doc comment variables', ['comment.block.documentation variable', 'variable.other.jsdoc'], p.cream, 'italic'),

    t('Strings', ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], p.green),
    t('Template expression', ['punctuation.definition.template-expression', 'punctuation.section.embedded'], p.red),
    t('Escapes and placeholders', ['constant.character.escape', 'constant.other.placeholder', 'constant.character.format.placeholder'], p.candy),
    t('Regular expressions', ['string.regexp', 'source.regexp'], p.ember),

    t('Numbers and language constants', ['constant.numeric', 'constant.language', 'constant.character', 'keyword.other.unit'], p.candy),
    t('Other constants', ['constant.other', 'support.constant', 'variable.other.constant', 'variable.other.enummember', 'entity.name.constant'], p.candy),

    t('Keywords', ['keyword', 'keyword.control', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical.python', 'keyword.operator.wordlike', 'storage.type.function.arrow'], p.red),
    t('Operators', ['keyword.operator', 'punctuation.accessor', 'punctuation.separator.key-value'], p.mint),
    t('Punctuation', ['punctuation', 'meta.brace', 'punctuation.terminator', 'punctuation.separator'], p.punct),

    t('Functions', ['entity.name.function', 'support.function', 'meta.function-call entity.name.function', 'variable.function', 'support.function.builtin'], p.gold),
    t('Types and classes', ['entity.name.type', 'entity.name.class', 'entity.other.inherited-class', 'support.type', 'support.class', 'entity.name.namespace', 'entity.name.type.module', 'storage.type.primitive', 'storage.type.built-in'], p.frost),
    t('Type parameters', ['entity.name.type.parameter', 'meta.type.parameters entity.name.type'], p.frost, 'italic'),

    t('Variables', ['variable', 'variable.other', 'variable.other.readwrite', 'meta.definition.variable'], p.fg),
    t('Parameters', ['variable.parameter', 'meta.parameter variable', 'variable.parameter.function'], p.cream, 'italic'),
    t('Language variables', ['variable.language', 'variable.language.this', 'variable.language.self', 'variable.parameter.function.language.special.self', 'variable.language.super'], p.ember, 'italic'),
    t('Properties', ['variable.other.property', 'variable.other.object.property', 'meta.object-literal.key', 'support.type.property-name', 'entity.name.tag.yaml', 'support.variable.property', 'variable.other.member'], p.plum),
    t('Decorators', ['meta.decorator', 'entity.name.function.decorator', 'punctuation.decorator', 'storage.type.annotation', 'punctuation.definition.annotation'], p.ember),

    t('Tags', ['entity.name.tag', 'punctuation.definition.tag'], p.red),
    t('Component tags', ['support.class.component', 'entity.name.tag.component'], p.frost),
    t('Attributes', ['entity.other.attribute-name'], p.gold),
    t('CSS classes and ids', ['entity.other.attribute-name.class.css', 'entity.other.attribute-name.class'], p.gold),
    t('CSS ids', ['entity.other.attribute-name.id', 'entity.other.attribute-name.id.css'], p.ember),
    t('CSS property values', ['support.constant.property-value', 'support.constant.color', 'constant.other.color'], p.candy),
    t('CSS pseudo', ['entity.other.attribute-name.pseudo-class', 'entity.other.attribute-name.pseudo-element'], p.mint),

    t('Markdown headings', ['markup.heading', 'entity.name.section', 'markup.heading punctuation.definition.heading'], p.red, 'bold'),
    t('Markdown bold', ['markup.bold'], p.gold, 'bold'),
    t('Markdown italic', ['markup.italic'], p.plum, 'italic'),
    t('Markdown strikethrough', ['markup.strikethrough'], p.fgSubtle, 'strikethrough'),
    t('Markdown code', ['markup.inline.raw', 'markup.fenced_code', 'markup.raw'], p.green),
    t('Markdown links', ['markup.underline.link', 'string.other.link'], p.frost),
    t('Markdown quotes', ['markup.quote'], p.comment, 'italic'),
    t('Markdown lists', ['punctuation.definition.list.begin.markdown', 'beginning.punctuation.definition.list.markdown'], p.gold),

    t('Diff inserted', ['markup.inserted', 'meta.diff.header.to-file'], p.green),
    t('Diff deleted', ['markup.deleted', 'meta.diff.header.from-file'], p.red),
    t('Diff changed', ['markup.changed'], p.gold),
    t('Diff range', ['meta.diff.range', 'meta.diff.header'], p.frost),

    t('Invalid', ['invalid', 'invalid.illegal'], p.red, 'underline'),
    t('Deprecated', ['invalid.deprecated'], p.fgSubtle, 'strikethrough'),
  ];
}

function semantic(p) {
  return {
    namespace: p.frost,
    class: p.frost,
    interface: p.frost,
    enum: p.frost,
    type: p.frost,
    struct: p.frost,
    typeParameter: { foreground: p.frost, italic: true },
    function: p.gold,
    method: p.gold,
    macro: p.ember,
    decorator: p.ember,
    parameter: { foreground: p.cream, italic: true },
    variable: p.fg,
    'variable.defaultLibrary': p.frost,
    property: p.plum,
    enumMember: p.candy,
    'variable.readonly.defaultLibrary': p.candy,
    selfKeyword: { foreground: p.ember, italic: true },
    selfParameter: { foreground: p.ember, italic: true },
  };
}

function build(p) {
  return {
    $schema: 'vscode://schemas/color-theme',
    name: p.name,
    type: p.type,
    semanticHighlighting: true,
    colors: workbench(p),
    tokenColors: tokens(p),
    semanticTokenColors: semantic(p),
  };
}

// WCAG contrast check so every syntax colour stays readable on its background.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(f, b) {
  const [l1, l2] = [luminance(f), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

let failed = false;
for (const [file, p] of [['mistletoe-midnight-color-theme.json', midnight], ['mistletoe-frost-color-theme.json', frost]]) {
  writeFileSync(join(root, 'themes', file), JSON.stringify(build(p), null, 2) + '\n');
  const checks = ['fg', 'fgMuted', 'comment', 'punct', 'red', 'green', 'gold', 'frost', 'candy', 'mint', 'cream', 'ember', 'plum']
    .map((k) => [k, contrast(p[k], p.bg)]);
  checks.push(['statusFg/statusBg', contrast(p.statusFg, p.statusBg)]);
  checks.push(['buttonFg/buttonBg', contrast(p.buttonFg, p.buttonBg)]);
  const line = checks.map(([k, r]) => `${k} ${r.toFixed(1)}${r < 4.5 ? (k === 'comment' && r >= 3.5 ? '~' : '!') : ''}`).join('  ');
  console.log(`${p.name}: ${line}`);
  if (checks.some(([k, r]) => r < (k === 'comment' ? 3.5 : 4.5))) failed = true;
}
if (failed) {
  console.error('Contrast check failed (need 4.5:1, comments 3.5:1).');
  process.exit(1);
}
