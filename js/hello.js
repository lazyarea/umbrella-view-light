
var dp = new DayPilot.Calendar("dp");

// view
dp.cellDuration = 15;
dp.startDate = "2013-03-25";  // or just dp.startDate = "2013-03-25";
dp.days = 1;
dp.allDayEventHeight = 10;
dp.initScrollPos = 9 * 40;
dp.dayBeginsHour = 10;
dp.dayEndsHour = 19;
dp.moveBy = 'Full';
dp.columnWidthSpec = "Fixed";
dp.columnWidth = 80;
dp.viewType = "Resources";
dp.headerLevels = 2;
dp.columns = [];

var df = "diffadd=0";
var diffadd = (window.location.href.split('?')[1]) ?  window.location.href.split('?')[1].split('&') : df;
var f = null;
for(var i=0;i<diffadd.length;i++){
    f = diffadd[i].match(/^dateadd=[0-9]+/i);
    if( f) break;
}
if (f == null) {f={};f.input = df;}

for( var i=0;i<7;i++){
    var obj = {};
    console.log( Number(f.input) );
    obj.name = moment().add( (i + Number(f.input.split("=")[1])), 'days').format("LL");
    obj.children = [];
    for( var j=1;j<=3;j++){
        var child = {};
        child.name = "Machine #" + j;
        child.start = moment().add(i, 'days').format("YYYY-MM-DD");
        child.id = "m" + j;
        obj.children.push(child);
    }
    dp.columns.push(obj);
}

// bubble, with async loading
dp.bubble = new DayPilot.Bubble({
    cssClassPrefix: "bubble_default",
    onLoad: function(args) {
        var ev = args.source;
        args.async = true;  // notify manually using .loaded()

        // simulating slow server-side load
        setTimeout(function() {
            args.html = "testing bubble for: <br>" + ev.text();
            args.loaded();
        }, 500);
    }
});
dp.contextMenu = new DayPilot.Menu({
    cssClassPrefix: "menu_default",
    items: [
        {text:"Show event ID", onclick: function() {alert("Event value: " + this.source.value());} },
        {text:"Show event text", onclick: function() {alert("Event text: " + this.source.text());} },
        {text:"Show event start", onclick: function() {alert("Event start: " + this.source.start().toStringSortable());} },
        {text:"Show event end", onclick: function() {alert("Event end: " + this.source.end().toStringSortable());} },
        {text:"Delete", onclick: function() { dp.events.remove(this.source); } }
    ]});

// event moving
dp.onEventMoved = function (args) {
    dp.message("Moved: " + args.e.text());
};
// event resizing
dp.onEventResized = function (args) {
    dp.message("Resized: " + args.e.text());
};

// event creating
dp.onTimeRangeSelected = function (args) {

    var obj = {
        start: args.start,
        end: args.end,
        id: DayPilot.guid(),
        resource: args.resource,
        text: "Event"
    };
    dp.openModal(obj);
    dp.clearSelection();

    // var name = prompt("New event name:", "Event");
    // if (!name) return;
    //
    // var e = new DayPilot.Event({
    //     start: args.start,
    //     end: args.end,
    //     id: DayPilot.guid(),
    //     resource: args.resource,
    //     text: "Event"
    // });
    //
    // dp.events.add(e);
    // // dp.clearSelection();
    // dp.message("Created");
};

dp.onTimeRangeDoubleClicked = function(args) {
    alert("DoubleClick: start: " + args.start + " end: " + args.end + " resource: " + args.resource);
};

dp.headerHeightAutoFit = true;

dp.init();

dp.openModal = function(args) {
    var guid   = args.id;
    var startH = args.start.value.split('T')[1].split(':')[0];
    var startM = args.start.value.split('T')[1].split(':')[1];
    var endH = args.end.value.split('T')[1].split(':')[0];
    var endM = args.end.value.split('T')[1].split(':')[1];
    var resource = args.resource.replace('m','');

    jQuery('.modal').modal('show', function(){});
    jQuery('.modal-header h4').text(args.start.value.split('T')[0]);
    jQuery('select#startHour').parent().find('button > span.filter-option.pull-left').text(startH);
    jQuery('select#startTime').parent().find('button > span.filter-option.pull-left').text(startM);
    jQuery('select#endHour').parent().find('button > span.filter-option.pull-left').text(endH);
    jQuery('select#endTime').parent().find('button > span.filter-option.pull-left').text(endM);
    jQuery('select#resource').parent().find('button > span.filter-option.pull-left').text(resource);
    jQuery('textarea#text').val(args.text);
    jQuery('input#guid').val(guid);
};

dp.onEventClick = function(args) {
    var obj = {};
    obj.id   = args.e.id();
    obj.start = args.e.start();
    obj.end = args.e.end();
    obj.resource = args.e.resource().replace('m','');
    obj.text = args.e.text();

    dp.openModal(obj);
};

var rsv = [
    {
        "guid": "41f9f9bd-c680-c8fd-ec09-a80b5465df70",
        "start_dt": "2015-06-19T12:00:00",
        "end_dt": "2015-06-19T13:00:00",
        "title": "Special event",
        "text": "Special msg",
        "resource": "m2"
    },
    {
        "guid": "41f9f9bd-c680-c8fd-ec09-a80b5465df71",
        "start_dt": "2015-06-21T12:00:00",
        "end_dt": "2015-06-21T13:00:00",
        "text": "Special event",
        "resource": "m1"
    }
];
for( var i=0; i<rsv.length; i++){
    var e = new DayPilot.Event({
        start: new DayPilot.Date(rsv[i].start_dt),
        end: new DayPilot.Date(rsv[i].end_dt).addHours(1),
        id: rsv[i].guid,
        text: rsv[i].text,
        resource: rsv[i].resource

    });
    dp.events.add(e);
}

jQuery('#staticModal').on('click', '.modal-footer .btn-primary', function() {
    jQuery('#staticModal').modal('hide');
    // console.log(DayPilot.guid());
    event.preventDefault();
    jQuery.ajax({
        method: "POST",
        url: "http://www.example.com/api.php",
        data: {
            start_dt: sprintf('%sT%02d:%02d:00',jQuery('h4.modal-title').text(), jQuery('select#startHour').parent().find('button > span.filter-option.pull-left').text(), jQuery('select#startTime').parent().find('button > span.filter-option.pull-left').text()),
            end_dt: sprintf('%sT%02d:%02d:00',jQuery('h4.modal-title').text(), jQuery('select#endHour').parent().find('button > span.filter-option.pull-left').text(), jQuery('select#endTime').parent().find('button > span.filter-option.pull-left').text()),
            text: jQuery('textarea#text').val(),
            resource: jQuery('select#resource').val(),
            guid: jQuery('input#guid').val()
        },
        xhrFields: {
            withCredentials: true
        },
    })
    .done(function(result, textStatus, xhr) {
        console.log( "success" );
    })
    .fail(function(xhr, textStatus, error) {
        console.log( "error" );
    // })
    // .always(function() {
    //     alert( "complete" );
    // });
    // jqxhr.always(function() {
    //     alert( "second complete" );
    });

    console.log('変更を保存をクリックしました。');
    dp.message("Created");
});

jQuery('#date-minus').on('click', function() {
    var dt = jQuery('.page-title h3').text();
    jQuery(".page-title h3").text( moment(dt,'LL').add(-1, 'days').format("LL") );
});
jQuery('#date-current').on('click', function() {
    jQuery(".page-title h3").text( moment().format("LL") );
});
jQuery('#date-next').on('click', function() {
    var dt = jQuery('.page-title h3').text();
    jQuery(".page-title h3").text( moment(dt,'LL').add(1, 'days').format("LL") );
});
