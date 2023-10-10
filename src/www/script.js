import { html, reactive } from '@arrow-js/core';
import ms from 'ms';

const appElement = document.getElementById('app');

const data = reactive({
  onlineFor: 0,
});

const template = html`Jarvis:
  <em>I've been online, for ${() => ms(data.onlineFor * 1000)} Sir.</em>`;

template(appElement);

setInterval(() => {
  data.onlineFor += 1;
}, 1000);
