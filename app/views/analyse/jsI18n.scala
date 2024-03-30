package views.html.analyse

import play.api.i18n.Lang
import views.html.board.userAnalysisI18n as board

import lila.app.templating.Environment.*
import lila.core.i18n.I18nKey as trans

object jsI18n:

  def apply()(using Translate) = i18nJsObject(i18nKeys)

  private val i18nKeys = {
    board.cevalWidget ++
      board.advantageChartTranslations ++
      board.explorerTranslations ++
      Vector(
        trans.site.flipBoard,
        trans.site.gameAborted,
        trans.site.gameOver,
        trans.site.checkmate,
        trans.site.whiteResigned,
        trans.site.blackResigned,
        trans.site.whiteDidntMove,
        trans.site.blackDidntMove,
        trans.site.stalemate,
        trans.site.whiteLeftTheGame,
        trans.site.blackLeftTheGame,
        trans.site.draw,
        trans.site.whiteTimeOut,
        trans.site.blackTimeOut,
        trans.site.playingRightNow,
        trans.site.whiteIsVictorious,
        trans.site.blackIsVictorious,
        trans.site.cheatDetected,
        trans.site.kingInTheCenter,
        trans.site.threeChecks,
        trans.site.variantEnding,
        trans.site.drawByMutualAgreement,
        trans.site.fiftyMovesWithoutProgress,
        trans.site.insufficientMaterial,
        trans.site.analysis,
        trans.site.boardEditor,
        trans.site.continueFromHere,
        trans.site.playWithTheMachine,
        trans.site.playWithAFriend,
        trans.site.openingExplorer,
        trans.site.nbInaccuracies,
        trans.site.nbMistakes,
        trans.site.nbBlunders,
        trans.site.averageCentipawnLoss,
        trans.site.accuracy,
        trans.site.viewTheSolution,
        trans.site.youNeedAnAccountToDoThat,
        trans.site.aiNameLevelAiLevel,
        // action menu
        trans.site.menu,
        trans.site.toStudy,
        trans.site.inlineNotation,
        trans.site.makeAStudy,
        trans.site.clearSavedMoves,
        trans.site.computerAnalysis,
        trans.site.enable,
        trans.site.bestMoveArrow,
        trans.site.showVariationArrows,
        trans.site.evaluationGauge,
        trans.site.infiniteAnalysis,
        trans.site.removesTheDepthLimit,
        trans.site.multipleLines,
        trans.site.cpus,
        trans.site.memory,
        trans.site.engineManager,
        trans.site.replayMode,
        trans.site.slow,
        trans.site.fast,
        trans.site.realtimeReplay,
        trans.site.byCPL,
        // context menu
        trans.site.promoteVariation,
        trans.site.makeMainLine,
        trans.site.deleteFromHere,
        trans.site.forceVariation,
        trans.site.copyVariationPgn,
        // practice (also uses checkmate, draw)
        trans.site.practiceWithComputer,
        trans.puzzle.goodMove,
        trans.site.inaccuracy,
        trans.site.mistake,
        trans.site.blunder,
        trans.site.threefoldRepetition,
        trans.site.anotherWasX,
        trans.site.bestWasX,
        trans.site.youBrowsedAway,
        trans.site.resumePractice,
        trans.site.whiteWinsGame,
        trans.site.blackWinsGame,
        trans.site.drawByFiftyMoves,
        trans.site.theGameIsADraw,
        trans.site.yourTurn,
        trans.site.computerThinking,
        trans.site.seeBestMove,
        trans.site.hideBestMove,
        trans.site.getAHint,
        trans.site.evaluatingYourMove,
        // retrospect (also uses youBrowsedAway, bestWasX, evaluatingYourMove)
        trans.site.learnFromYourMistakes,
        trans.site.learnFromThisMistake,
        trans.site.skipThisMove,
        trans.site.next,
        trans.site.xWasPlayed,
        trans.site.findBetterMoveForWhite,
        trans.site.findBetterMoveForBlack,
        trans.site.resumeLearning,
        trans.site.youCanDoBetter,
        trans.site.tryAnotherMoveForWhite,
        trans.site.tryAnotherMoveForBlack,
        trans.site.solution,
        trans.site.waitingForAnalysis,
        trans.site.noMistakesFoundForWhite,
        trans.site.noMistakesFoundForBlack,
        trans.site.doneReviewingWhiteMistakes,
        trans.site.doneReviewingBlackMistakes,
        trans.site.doItAgain,
        trans.site.reviewWhiteMistakes,
        trans.site.reviewBlackMistakes
      )
  }.distinct
