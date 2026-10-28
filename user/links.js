

const TEMP_PAGE = 'temp.html';

function temp(name) {
    return TEMP_PAGE + '?page=' + name;
}

const PAGE_LINKS = {
    home:          temp('home'),          
    dashboard:     temp('dashboard'),     
    browse:        temp('browse'),        
    bookmarks:     'bookmarks.html',       
    submit:        temp('submit'),        
    subscriptions: temp('subscriptions'), 
    help:          temp('help'),          
    login:         temp('login'),         
    register:      temp('register')      
};

function applyPageLinks() {
    document.querySelectorAll('[data-link]').forEach(function (el) {
        const target = PAGE_LINKS[el.dataset.link];

        if (!target) {
            console.warn('No link defined for:', el.dataset.link);
            return;
        }

        const hash = el.dataset.hash ? '#' + el.dataset.hash : '';
        el.setAttribute('href', target + hash);
    });
}
