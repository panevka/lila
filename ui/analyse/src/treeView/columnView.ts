import { VNode } from 'snabbdom';
import { isEmpty } from 'common';
import * as licon from 'common/licon';
import { LooseVNodes, looseH as h } from 'common/snabbdom';
import { fixCrazySan } from 'chess';
import { path as treePath, ops as treeOps } from 'tree';
import * as moveView from '../view/moveView';
import AnalyseCtrl from '../ctrl';
import { ConcealOf, Conceal } from '../interfaces';
import {
  nonEmpty,
  mainHook,
  nodeClasses,
  renderInlineCommentsOf,
  retroLine,
  Ctx as BaseCtx,
  Opts as BaseOpts,
  renderComment,
  renderingCtx,
} from './common';

interface Ctx extends BaseCtx {
  concealOf: ConcealOf;
}
interface Opts extends BaseOpts {
  conceal?: Conceal;
  noConceal?: boolean;
}

function emptyMove(conceal?: Conceal): VNode {
  const c: { conceal?: true; hide?: true } = {};
  if (conceal) c[conceal] = true;
  return h('move.empty', { class: c }, '...');
}

function renderChildrenOf(ctx: Ctx, node: Tree.Node, opts: Opts): LooseVNodes | undefined {
  const cs = node.children.filter(x => ctx.showComputer || !x.comp),
    main = cs[0];
  if (!main) return;
  const conceal = opts.noConceal
    ? null
    : opts.conceal || ctx.concealOf(true)(opts.parentPath + main.id, main);
  if (conceal === 'hide') return;
  if (opts.isMainline) {
    const isWhite = main.ply % 2 === 1,
      commentTags = renderMainlineCommentsOf(ctx, main, conceal, true, opts.parentPath + main.id).filter(
        nonEmpty,
      );
    if (!cs[1] && isEmpty(commentTags) && !main.forceVariation)
      return [
        isWhite && moveView.renderIndex(main.ply, false),
        ...renderMoveAndChildrenOf(ctx, main, {
          parentPath: opts.parentPath,
          isMainline: true,
          depth: opts.depth,
          conceal,
        }),
      ];
    const mainChildren =
      !main.forceVariation &&
      renderChildrenOf(ctx, main, {
        parentPath: opts.parentPath + main.id,
        isMainline: true,
        depth: opts.depth,
        conceal,
      });

    const passOpts = {
      parentPath: opts.parentPath,
      isMainline: !main.forceVariation,
      depth: opts.depth,
      conceal,
    };

    return [
      isWhite && moveView.renderIndex(main.ply, false),
      !main.forceVariation && renderMoveOf(ctx, main, passOpts),
      isWhite && !main.forceVariation && emptyMove(conceal),
      h(
        'interrupt',
        commentTags.concat(
          renderLines(ctx, node, main.forceVariation ? cs : cs.slice(1), {
            parentPath: opts.parentPath,
            isMainline: passOpts.isMainline,
            depth: opts.depth,
            conceal,
            noConceal: !conceal,
          }),
        ),
      ),
      isWhite && mainChildren && moveView.renderIndex(main.ply, false),
      isWhite && mainChildren && emptyMove(conceal),
      ...(mainChildren || []),
    ];
  }
  if (!cs[1]) return renderMoveAndChildrenOf(ctx, main, opts);
  return renderInlined(ctx, cs, opts) || [renderLines(ctx, node, cs, opts)];
}

function renderInlined(ctx: Ctx, nodes: Tree.Node[], opts: Opts): LooseVNodes | undefined {
  // only 2 branches
  if (!nodes[1] || nodes[2]) return;
  // only if second branch has no sub-branches
  if (treeOps.hasBranching(nodes[1], 6)) return;
  return renderMoveAndChildrenOf(ctx, nodes[0], {
    parentPath: opts.parentPath,
    isMainline: false,
    depth: opts.depth,
    noConceal: opts.noConceal,
    inline: nodes[1],
  });
}

function renderLines(ctx: Ctx, parentNode: Tree.Node, nodes: Tree.Node[], opts: Opts): VNode {
  const collapsed =
    parentNode.collapsed === undefined ? opts.depth >= 2 && opts.depth % 2 === 0 : parentNode.collapsed;
  return h('lines', { class: { single: !nodes[1], collapsed } }, [
    collapsed
      ? h('line', { class: { expand: true } }, [
          h('branch'),
          h('a', {
            attrs: { 'data-icon': licon.PlusButton, title: ctx.ctrl.trans.noarg('expandVariations') },
            on: { click: () => ctx.ctrl.setCollapsed(opts.parentPath, false) },
          }),
        ])
      : null,
    ...nodes.map(n => {
      return (
        retroLine(ctx, n) ||
        h('line', [
          h('branch'),
          ...renderMoveAndChildrenOf(ctx, n, {
            parentPath: opts.parentPath,
            isMainline: false,
            depth: opts.depth + 1,
            withIndex: true,
            noConceal: opts.noConceal,
            truncate: n.comp && !treePath.contains(ctx.ctrl.path, opts.parentPath + n.id) ? 3 : undefined,
          }),
        ])
      );
    }),
  ]);
}

function renderMoveOf(ctx: Ctx, node: Tree.Node, opts: Opts): VNode {
  return opts.isMainline ? renderMainlineMoveOf(ctx, node, opts) : renderVariationMoveOf(ctx, node, opts);
}

function renderMainlineMoveOf(ctx: Ctx, node: Tree.Node, opts: Opts): VNode {
  const path = opts.parentPath + node.id,
    classes = nodeClasses(ctx, node, path);
  if (opts.conceal) classes[opts.conceal as string] = true;
  return h('move', { attrs: { p: path }, class: classes }, moveView.renderMove(ctx, node));
}

function renderVariationMoveOf(ctx: Ctx, node: Tree.Node, opts: Opts): VNode {
  const withIndex = opts.withIndex || node.ply % 2 === 1,
    path = opts.parentPath + node.id,
    content: LooseVNodes = [withIndex && moveView.renderIndex(node.ply, true), fixCrazySan(node.san!)],
    classes = nodeClasses(ctx, node, path);
  if (opts.conceal) classes[opts.conceal as string] = true;
  if (node.glyphs) node.glyphs.forEach(g => content.push(moveView.renderGlyph(g)));
  return h('move', { attrs: { p: path }, class: classes }, content);
}

function renderMoveAndChildrenOf(ctx: Ctx, node: Tree.Node, opts: Opts): LooseVNodes {
  const path = opts.parentPath + node.id;
  if (opts.truncate === 0) return [h('move', { attrs: { p: path } }, [h('index', '[...]')])];
  return [
    renderMoveOf(ctx, node, opts),
    ...renderInlineCommentsOf(ctx, node, path),
    opts.inline && renderInline(ctx, opts.inline, opts),
    ...(renderChildrenOf(ctx, node, {
      parentPath: path,
      isMainline: opts.isMainline,
      depth: opts.depth,
      noConceal: opts.noConceal,
      truncate: opts.truncate ? opts.truncate - 1 : undefined,
    }) || []),
  ];
}

function renderInline(ctx: Ctx, node: Tree.Node, opts: Opts): VNode {
  return h(
    'inline',
    renderMoveAndChildrenOf(ctx, node, {
      withIndex: true,
      parentPath: opts.parentPath,
      isMainline: false,
      depth: opts.depth,
      noConceal: opts.noConceal,
      truncate: opts.truncate,
    }),
  );
}

function renderMainlineCommentsOf(
  ctx: Ctx,
  node: Tree.Node,
  conceal: Conceal,
  withColor: boolean,
  path: string,
): LooseVNodes {
  if (!ctx.ctrl.showComments || isEmpty(node.comments)) return [];

  const colorClass = withColor ? (node.ply % 2 === 0 ? '.black ' : '.white ') : '';

  return node.comments!.map(comment => {
    let sel = 'comment' + colorClass;
    if (comment.text.startsWith('Inaccuracy.')) sel += '.inaccuracy';
    else if (comment.text.startsWith('Mistake.')) sel += '.mistake';
    else if (comment.text.startsWith('Blunder.')) sel += '.blunder';
    if (conceal) sel += '.' + conceal;
    return renderComment(comment, node.comments!, sel, ctx, path, 400);
  });
}

const emptyConcealOf: ConcealOf = () => () => null;

export default function (ctrl: AnalyseCtrl, concealOf?: ConcealOf): VNode {
  const root = ctrl.tree.root;
  const ctx: Ctx = {
    ...renderingCtx(ctrl),
    concealOf: concealOf ?? emptyConcealOf,
  };
  //I hardcoded the root path, I'm not sure if there's a better way for that to be done
  const commentTags = renderMainlineCommentsOf(ctx, root, false, false, '');
  const blackStarts = (root.ply & 1) === 1;
  return h('div.tview2.tview2-column', { hook: mainHook(ctrl) }, [
    !isEmpty(commentTags) && h('interrupt', commentTags),
    blackStarts && moveView.renderIndex(root.ply, false),
    blackStarts && emptyMove(),
    ...(renderChildrenOf(ctx, root, { parentPath: '', isMainline: true, depth: 0 }) || []),
  ]);
}
