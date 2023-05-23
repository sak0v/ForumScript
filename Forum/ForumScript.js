// ==UserScript==

// @name Script for Admin

// @namespace https://forum.blackrussia.online

// @version 0.1

// @description forward-only!

// @author Aid Phantom

// @match https://forum.blackrussia.online/index.php?threads/*

// @include https://forum.blackrussia.online/index.php?threads/

// @icon https://forum.blackrussia.online/data/avatars/o/41/41376.jpg?1639676541

// @grant none

// @license MIT

// ==/UserScript==

(async function () {
    `use strict`;

 const UNACCEPT_PREFIX = 4; // Prefix that will be set when thread closes

 const ACCEPT_PREFIX = 8; // Prefix that will be set when thread accepted

 const PIN_PREFIX = 2; // Prefix that will be set when thread pins

 const COMMAND_PREFIX = 10; // Prefix that will be set when thread send to project team

 const WATCHED_PREFIX = 9;

 const CLOSE_PREFIX = 7;

 const TECH_PREFIX = 13;

 const RESHENO_PREFIX = 6;

 const data = await getThreadData(),

 greeting = data.greeting,

 user = data.user;

 const buttons = [

     {

 title: `Приветствие`,

 content: `[SIZE=4][FONT=times new roman][CENTER]${greeting},[SIZE=4][FONT=times new roman] уважаемый (ая) ${user.mention}.[/CENTER]`,

 },

     {

 title: `На рассмотрении`,

 content:

 `[SIZE=4][FONT=times new roman][CENTER]${greeting},[SIZE=4][FONT=times new roman] уважаемый (ая) ${user.mention}.[/CENTER]<br><br>` +

 `[COLOR=rgb(255, 255, 0)][SIZE=4][CENTER][FONT=times new roman]На рассмотрении.[/FONT][/SIZE][/COLOR][/CENTER]`,

 prefix: PIN_PREFIX,

 status: true,

 },

     {

title:`Одобрено`,

content:

`[SIZE=4][FONT=Times New Roman][CENTER]${greeting}, [SIZE=4][FONT=Times New Roman]уважаемый (ая) ${user.mention}. [/CENTER]<br>br` +

`[CENTER][SIZE=4][FONT=times new roman]Рассмотрев вашу жалобу,

были приняты следующие решения:

1. С администратором будет проведена беседа;

2. Если было выдано наказание, оно будет снято..<br><br>`+

`[COLOR=rgb(250, 128, 114) Одобрено. [/COLOR].[/SIZE][/FONT][/CENTER]`,

prefix: UNACCEPT_PREFIX,

status:true,

},
     ];

    $(document).ready(() => {
        // Загрузка скрипта для обработки шаблонов
        $(`body`).append(`<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js"></script>`);

        // Добавление кнопок при загрузке страницы
        addButton(`Ответы`, `selectAnswer`);
        addButton(`На рассмотрение`, `pin`);
        addButton(`Одобрено`, `accepted`);
        addButton(`КП`, `teamProject`);
        addButton(`Закрыть`, `closed`);
        adddButton(`Решено`,`decided`);




        // Поиск информации о теме
        const threadData = getThreadData();

       $(`button#unaccept`).click(() => editThreadData(UNACCEPT_PREFIX, false));
$(`button#pin`).click(() => editThreadData(PIN_PREFIX, true));
$(`button#accepted`).click(() => editThreadData(ACCEPT_PREFIX, false));
$(`button#mainadm`).click(() => editThreadData(MAINADM_PREFIX, true));
$(`button#watched`).click(() => editThreadData(WATCHED_PREFIX, false));
$(`button#decided`).click(() => editThreadData(RESHENO_PREFIX, false));
$(`button#closed`).click(() => editThreadData(CLOSE_PREFIX, false));
$(`button#techspec`).click(() => editThreadData(TECHADM_PREFIX, true));
        $(`button#statusTheme`).click(() => {
            const threadTitle = $(`.p-title-value`)[0].lastChild.textContent;

            let status = threadData.theme_status
            if ( status == false) status = 1
            else status = 0

            fetch(`${document.URL}edit`, {
                method: `POST`,
                body: getFormData({
                    title: threadTitle,
                    discussion_open: status,
                    _xfToken: XF.config.csrf,
                    _xfRequestUri: document.URL.split(XF.config.url.fullBase)[1],
                    _xfWithData: 1,
                    _xfResponseType: `json`,
                }),
            }).then(() => location.reload());
        });

        $(`button#selectAnswer`).click(() => {
            XF.alert(buttonsMarkup(buttons), null, `Select an answer:`);
            buttons.forEach((btn, id) => {
                if (id > 0) {
                    $(`button#answers-${id}`).click(() => pasteContent(id, threadData, true));
                } else {
                    $(`button#answers-${id}`).click(() => pasteContent(id, threadData, false));
                }
            });
        });
    });

    function addButton(name, id) {
        $(`.button--icon--reply`).before(
            `<button type="button" class="button rippleButton" id="${id}" style="margin: 3px;">${name}</button>`,
        );
    }

    function buttonsMarkup(buttons) {

        return `<div class="select_answer">${buttons
            .map(
            (btn, i) =>
            `<button id="answers-${i}" class="button--primary button ` +
            `rippleButton" style="margin:5px"><span class="button-text">${btn.title}</span></button>`,
        )
            .join(``)}</div>`;
    }



    function pasteContent(id, data = {}, send = false) {
        const template = Handlebars.compile(buttons[id].content);
        if ($(`.fr-element.fr-view p`).text() === ``) $(`.fr-element.fr-view p`).empty();

        $(`span.fr-placeholder`).empty();
        $(`div.fr-element.fr-view p`).append(template(data));
        $(`a.overlay-titleCloser`).trigger(`click`);

        if (send == true) {
            editThreadData(buttons[id].prefix, buttons[id].status);
            $(`.button--icon.button--icon--reply.rippleButton`).trigger(`click`);
        }
    }

    async function getThreadData() {
        const authorID = $(`a.username`)[0].attributes[`data-user-id`].nodeValue;
        const authorName = $(`a.username`).html();
        const theme_status = $(`a.discussion_open`).html();
        const hours = new Date().getHours();
        const greeting = 4 < hours && hours <= 11
        ? `Доброе утро`
    : 11 < hours && hours <= 15
    ? `Добрый день`
       : 15 < hours && hours <= 21
    ? `Добрый вечер`
           : `Доброй ночи`

    return {
        user: {
            id: authorID,
            name: authorName,
            mention: `[USER=${authorID}]${authorName}[/USER]`,
        },
        theme_status,
        greeting: greeting
    };
    }

    function editThreadData(prefix, pin = false) {
        // Получаем заголовок темы, так как он необходим при запросе
        const threadTitle = $(`.p-title-value`)[0].lastChild.textContent;

        if (pin == false) {
            fetch(`${document.URL}edit`, {
                method: `POST`,
                body: getFormData({
                    prefix_id: prefix,
                    title: threadTitle,
                    _xfToken: XF.config.csrf,
                    _xfRequestUri: document.URL.split(XF.config.url.fullBase)[1],
                    _xfWithData: 1,
                    _xfResponseType: `json`,
                }),
            }).then(() => location.reload());
        }
        if (pin == true) {
            fetch(`${document.URL}edit`, {
                method: `POST`,
                body: getFormData({
                    prefix_id: prefix,
                    title: threadTitle,
                    sticky: 1,
                    _xfToken: XF.config.csrf,
                    _xfRequestUri: document.URL.split(XF.config.url.fullBase)[1],
                    _xfWithData: 1,
                    _xfResponseType: `json`,
                }),
            }).then(() => location.reload());
        }
    }

    function getFormData(data) {
        const formData = new FormData();
        Object.entries(data).forEach(i => formData.append(i[0], i[1]));
        return formData;
    }
})();
