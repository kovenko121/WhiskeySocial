// Carries the `from_screen` value for the Article `$screen` event between the
// central navigation tracker (which knows the previous route) and the Article
// screen (which fires the event itself, since it's the only place the
// human-readable article title is available after the data loads).
let pendingFromScreen = 'app_start';

const setArticleFromScreen = (name: string) => {
  pendingFromScreen = name;
};

const getArticleFromScreen = () => pendingFromScreen;

export { setArticleFromScreen, getArticleFromScreen };
