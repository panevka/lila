import chessground from 'chessground';
import * as ground from './ground';
import type { Square as Key } from 'chess.js';
import { LevelCtrl } from './levelCtrl';
import { RunCtrl } from './runCtrl';
import { PromotionRole } from './util';
import { h } from 'snabbdom';
const opposite = chessground.util.opposite;
const key2pos = chessground.util.key2pos;

let promoting:
  | false
  | {
      orig: Key;
      dest: Key;
      callback: PromotionCallback;
    } = false;

type PromotionCallback = (orig: Key, dest: Key, role: PromotionRole) => void;

export function start(orig: Key, dest: Key, callback: PromotionCallback) {
  const piece = ground.pieces()[dest];
  if (
    piece &&
    piece.role == 'pawn' &&
    ((dest[1] == '1' && piece.color == 'black') || (dest[1] == '8' && piece.color == 'white'))
  ) {
    promoting = {
      orig: orig,
      dest: dest,
      callback: callback,
    };
    m.redraw();
    return true;
  }
  return false;
}

function finish(role: PromotionRole) {
  if (promoting) {
    ground.promote(promoting.dest, role);
    promoting.callback(promoting.orig, promoting.dest, role);
  }
  promoting = false;
}

function renderPromotion(
  ctrl: RunCtrl,
  dest: Key,
  pieces: PromotionRole[],
  color: Color,
  orientation: Color,
  explain: boolean,
) {
  if (!promoting) return;

  let left = (8 - key2pos(dest)[0]) * 12.5;
  if (orientation === 'white') left = 87.5 - left;

  const vertical = color === orientation ? 'top' : 'bottom';

  return h('div#promotion-choice.' + vertical, [
    ...pieces.map(function (serverRole, i) {
      // TODO:
      i;
      left;
      return h(
        'square',
        {
          // TODO:
          // style: vertical + ': ' + i * 12.5 + '%;left: ' + left + '%',
          onclick: function (e: Event) {
            e.stopPropagation();
            finish(serverRole);
          },
        },
        h('piece.' + serverRole + '.' + color),
      );
    }),
    explain ? renderExplanation(ctrl) : null,
  ]);
}

function renderExplanation(ctrl: RunCtrl) {
  return h('div.explanation', [
    h('h2', ctrl.trans.noarg('pawnPromotion')),
    h('p', ctrl.trans.noarg('yourPawnReachedTheEndOfTheBoard')),
    h('p', ctrl.trans.noarg('itNowPromotesToAStrongerPiece')),
    h('p', ctrl.trans.noarg('selectThePieceYouWant')),
  ]);
}

export function view(ctrl: RunCtrl, stage: LevelCtrl) {
  if (!promoting) return;
  const pieces: PromotionRole[] = ['queen', 'knight', 'rook', 'bishop'];

  return renderPromotion(
    ctrl,
    promoting.dest,
    pieces,
    opposite(ground.data().turnColor),
    ground.data().orientation,
    !!stage.blueprint.explainPromotion,
  );
}

export function reset() {
  promoting = false;
}
