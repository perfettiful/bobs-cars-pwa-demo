const Handlebars = require('handlebars');


module.exports = {
    // the helper method 'format_time' will take in a timestamp and return a string with only the time
    format_time: (date) => {
        // We use the 'toLocaleTimeString()' method to format the time as H:MM:SS AM/PM
        return date.toLocaleTimeString();
    },
    link: function (text, url) {
        var url = Handlebars.escapeExpression(url),
            text = Handlebars.escapeExpression(text)

        return new Handlebars.SafeString("<a href='" + url + "'>" + text + "</a>");
    }
};
