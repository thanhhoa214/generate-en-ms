const generateKey = (text) => {
  const nonSpecialLowerText = text
    .trim()
    .replace(/[^a-z0-9\s\n]+/gi, '')
    .toLowerCase();
  let key = nonSpecialLowerText;
  if (nonSpecialLowerText.length > 30) {
    const lastNearest30thSpaceIndex = nonSpecialLowerText
      .substring(0, 30)
      .lastIndexOf(' ');
    if (lastNearest30thSpaceIndex === -1) key = text;
    else key = nonSpecialLowerText.substring(0, lastNearest30thSpaceIndex);
  }

  return key.replace(/\s/g, '_');
};

const copyTextToClipboard = (textAreaId) => {
  const element = $('#' + textAreaId);
  const smallAlertBtn = $(`[data-for=${textAreaId}]`);

  element.select();
  document.execCommand('copy');
  smallAlertBtn.removeClass('d-none');
  setTimeout(() => {
    smallAlertBtn.addClass('d-none');
  }, 700);

  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
};
// Credit David Walsh (https://davidwalsh.name/javascript-debounce-function)

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  let timeout;

  return function executedFunction() {
    const context = this;
    const args = arguments;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

const mainProcess = async (event) => {
  const sourceLang = 'en';
  const targetLang = 'vi';

  const sourceText = event.target.value;
  let result = {
    en: {},
    vi: {},
  };

  const url = `https://translate.googleapis.com/language/translate/v2?source=${sourceLang}&target=${targetLang}&format=text&key=AIzaSyDGOrd72uuMXDHOzWLQD7g9O_E1YmcRQQU&q=${encodeURI(
    sourceText
  )}`;

  // Get Malaysian
  const response = await fetch(url);
  const { data } = await response.json();
  const { translatedText: viTranslated } = data.translations[0];

  const enLines = sourceText.split(/\n/);
  const viLines = viTranslated.split(/\n/);

  enLines.forEach((enLine, index) => {
    const key = generateKey(enLine);
    result = {
      en: {
        ...result.en,
        [key]: enLine,
      },
      vi: {
        ...result.vi,
        [key]: viLines[index],
      },
    };
  });

  $('#en').text(JSON.stringify(result.en, null, '\t'));
  $('#vi').text(JSON.stringify(result.vi, null, '\t'));
};

$('#source').on('keyup', debounce(mainProcess, 1000));
$('#copy-en').on('click', (e) => copyTextToClipboard('en'));
$('#copy-vi').on('click', (e) => copyTextToClipboard('vi'));
