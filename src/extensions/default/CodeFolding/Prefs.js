/**
 * Wrapper around brackets pref system to ensure preferences are stored in in one single object instead of using multiple keys.
 * This is to make it easy for the user who edits their preferences file to easily manage the potentially numerous lines of preferences generated by the persisting code-folding state.
 * @author Patrick Oladimeji
 * @date 3/22/14 20:39:53 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets*/
define(function (require, exports, module) {
    "use strict";
    var PreferencesManager          = brackets.getModule("preferences/PreferencesManager"),
        prefs                       = PreferencesManager.getExtensionPrefs("code-folding"),
        foldsKey                    = "code-folding.folds",
        // preference key strings are here for now since they are not used in any UI
        ENABLE_CODE_FOLDING         = "Enable code folding",
        MIN_FOLD_SIZE               = "Minimum fold size",
        MIN_FOLD_SIZE_HELP          = "Minimum number of lines to allow in a foldable range",
        SAVE_FOLD_STATES            = "Save fold states",
        SAVE_FOLD_STATES_HELP       = "Save fold states to disk when editor is closed and restore the folds when reopened",
        ALWAYS_USE_INDENT_FOLD      = "Always use indent fold",
        ALWAYS_USE_INDENT_FOLD_HELP = "Fall back to using level of indentation as a folding guideline if no range finder is found for the current mode.",
        FADE_FOLD_BUTTONS           = "Fade fold buttons",
        FADE_FOLD_BUTTONS_HELP      = "Hides the fold buttons unless the mouse is over the gutter",
        MAX_FOLD_LEVEL              = "Max fold level",
        MAX_FOLD_LEVEL_HELP         = "Used to limit the number of nested folds to find and collapse when View -> Collapse All is called or Alt is held down when collapsing. Should improve performance for large files.";

    //default preference values
    prefs.definePreference("enabled", "boolean", true,
                           {name: ENABLE_CODE_FOLDING, description: ENABLE_CODE_FOLDING});
    prefs.definePreference("minFoldSize", "number", 2,
                           {name: MIN_FOLD_SIZE, description: MIN_FOLD_SIZE_HELP});
    prefs.definePreference("saveFoldStates", "boolean", true,
                           {name: SAVE_FOLD_STATES, description: SAVE_FOLD_STATES_HELP});
    prefs.definePreference("alwaysUseIndentFold", "boolean", false,
                           {name: ALWAYS_USE_INDENT_FOLD, description: ALWAYS_USE_INDENT_FOLD_HELP});
    prefs.definePreference("fadeFoldButtons", "boolean", false,
                           {name: FADE_FOLD_BUTTONS, description: FADE_FOLD_BUTTONS_HELP});
    prefs.definePreference("maxFoldLevel", "number", 2,
                           {name: MAX_FOLD_LEVEL, description: MAX_FOLD_LEVEL_HELP});
    prefs.definePreference("folds", "object", {});

    /**
      * Simplifies the fold ranges into an array of pairs of numbers.
      * @param {!Object} folds the raw fold ranges indexed by line numbers
      * @return {Object} an object whose keys are line numbers and the values are array
      * of two 2-element arrays. First array contains [from.line, from.ch] and the second contains [to.line, to.ch]
      */
    function simplify(folds) {
        if (!folds) {
            return;
        }
        var res = {}, range;
        Object.keys(folds).forEach(function (line) {
            range = folds[line];
            res[line] = Array.isArray(range) ? range : [[range.from.line, range.from.ch], [range.to.line, range.to.ch]];
        });
        return res;
    }

    /**
      * Inflates the fold ranges stored as simplified numeric arrays. The inflation converts the data into
      * objects whose keys are line numbers and whose values are objects in the format {from: {line, ch}, to: {line, ch}}.
      * @param {Object}  folds the simplified fold ranges
      * @return {Object} the converted fold ranges
      */
    function inflate(folds) {
        if (!folds) {
            return;
        }
         //transform the folds into objects with from and to properties
        var ranges = {}, obj;
        Object.keys(folds).forEach(function (line) {
            obj = folds[line];
            ranges[line] = {from: {line: obj[0][0], ch: obj[0][1]}, to: {line: obj[1][0], ch: obj[1][1]}};
        });

        return ranges;
    }

    /**
      * Gets the line folds saved for the specified path.
      * @param {string} path the document path
      * @return {Object} the line folds for the document at the specified path
      */
    function getFolds(path) {
        var folds = (PreferencesManager.getViewState(foldsKey) || {});
        return inflate(folds[path]);
    }

    /**
      * Saves the line folds for the specified path
      * @param {!string} path the path to the document
      * @param {Object} folds the fold ranges to save for the current document
      */
    function setFolds(path, folds) {
        var allFolds = PreferencesManager.getViewState(foldsKey);
        allFolds[path] = simplify(folds);
        PreferencesManager.setViewState(foldsKey, allFolds);
    }

    /**
      * Get the code folding setting with the specified key from the store
      * @param {!string} key The key for the setting to retrieve
      * @return {string} the setting with the specified key
      */
    function getSetting(key) {
        return prefs.get(key);
    }

    /**
      * Clears all the saved line folds for all documents.
      */
    function clearAllFolds() {
        PreferencesManager.setViewState(foldsKey, {});
    }

    module.exports.getFolds = getFolds;

    module.exports.setFolds = setFolds;

    module.exports.getSetting = getSetting;

    module.exports.clearAllFolds = clearAllFolds;

    module.exports.prefBase = prefs;

});
