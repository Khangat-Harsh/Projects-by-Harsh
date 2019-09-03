var ProgramPlayer = ProgramPlayer || {
    wordsListArray: null,
    timeoutToShow: null,
    timeoutToClear: null,
    nextPreparedWord: null,
    sliderStartRange: null,
    sliderEndRange: null,
    spinnerNumberOfLettersInput: null,
    comparisionAnswers: [],
    onLoad: function () {

        $(".ProgramPlayer-wrapper select.ProgramPlayer-Mode").bind("change.customEvent", ProgramPlayer.ModeChanged)
        $(".ProgramPlayer-wrapper .SlideNext").bind("click.customEvent", ProgramPlayer.slideNext);
        $(".ProgramPlayer-wrapper .ProgramPlayer-Play").bind("click.customEvent", ProgramPlayer.playSlider);
        $(".ProgramPlayer-wrapper .openFullScreen").bind("click.customEvent", ProgramPlayer.playSliderFullscreen);
        $(".ProgramPlayer-wrapper .closeFullScreen").bind("click.customEvent", ProgramPlayer.CloseSliderFullscreen);

        ProgramPlayer.ModeChanged();
    },
    ModeChanged: function () {
        ProgramPlayer.mode = $(".ProgramPlayer-wrapper select.ProgramPlayer-Mode").val();
        // reading = 1, comparing = 2 
        ProgramPlayer.wordsListArray = ProgramPlayer.getListOfWords();
        ProgramPlayer.initialiseSpinner();
        ProgramPlayer.initialiseRangeSlider(ProgramPlayer.wordsListArray.length);
        ProgramPlayer.initialiseSliderControls();
    },
    initialiseSpinner: function () {
        ProgramPlayer.spinnerNumberOfLettersInput = $("#spinnerNumberOfLettersInput").spinner({ min: 1, max: 15 });
    },
    initialiseRangeSlider: function (max) {
        var minRange = 0;
        var step = 1;
        if (max > 1000) {
            step = 1000;
        }
        $("#slider-range").slider({
            range: true,
            min: minRange,
            max: max,
            step: step,
            values: [0, max],
            slide: function (event, ui) {

                // allow change
                ProgramPlayer.sliderStartRange = ui.values[0];
                ProgramPlayer.sliderEndRange = ui.values[1];

                $(".sliderStartRange").text(ProgramPlayer.sliderStartRange)
                $(".sliderEndRange").text(ProgramPlayer.sliderEndRange)

            }
        });
        $(".sliderStartRange").text($("#slider-range").slider("values", 0));
        $(".sliderEndRange").text($("#slider-range").slider("values", 1));

    },
    initialiseSliderControls: function () {
        if (ProgramPlayer.mode == 1) {//reading

            $(".spinner-wrapper").removeClass("ms-hide");
            ProgramPlayer.spinnerNumberOfLettersInput.spinner("enable");
            //disable comparing controls
            ProgramPlayer.disableComparisionControl();
            $(document).unbind("keydown.customEvent");
        } else if (ProgramPlayer.mode == 2) {//comparing
            $(".spinner-wrapper").addClass("ms-hide");
            ProgramPlayer.spinnerNumberOfLettersInput.spinner("disable");
            ProgramPlayer.spinnerNumberOfLettersInput.spinner("value", 9);
            ProgramPlayer.enableComparisionControl();
            $(document).unbind("keydown.customEvent").bind("keydown.customEvent", ProgramPlayer.checkKey)
        }
        if ($("body").hasClass("slider-playing"))
            ProgramPlayer.slideNext();
    },
    getListOfWords: function () {
        var url;

        if (ProgramPlayer.mode == 1) // reading
        {
            if (ProgramPlayer.readingWords && ProgramPlayer.readingWords.length) {
                return ProgramPlayer.readingWords;
            } else {
                url = "/TeachingResources/Academics/Reading/wordsList.txt";
            }
        }
        else if (ProgramPlayer.mode == 2) // comparing
        {
            if (ProgramPlayer.comparingWords && ProgramPlayer.comparingWords.length) {
                return ProgramPlayer.comparingWords
            }
            else {
                url = "/TeachingResources/Academics/Reading/ComparingWordList.txt";
            }
        }

        var words;
        if (url) {
            $.ajax({
                url: url,
                async: false,
                type: "GET"
            }).done(handler);
            function handler(data) {
                words = data.split('\n').filter(function (el) { return el; });
            }
        }
        if (ProgramPlayer.mode == 1)
            ProgramPlayer.readingWords = words;
        else if (ProgramPlayer.mode == 2)
            ProgramPlayer.comparingWords = words;

        return words;
    },
    checkKey: function (e) {

        var ifSliderPlaying = $("body").hasClass("slider-playing");
        if (ifSliderPlaying) {
            e = e || window.event;

            if (e.keyCode == '38') {
                // up arrow
            }
            else if (e.keyCode == '40') {
                // down arrow
            }
            else if (e.keyCode == '37') {
                // left arrow
                ProgramPlayer.ComparingLeft();
            }
            else if (e.keyCode == '39') {
                // right arrow
                ProgramPlayer.ComparingRight();
            }
        }

    },
    ComparingLeft: function () {

        var leftWord = $(".comparing-leftword").text();
        var rightWord = $(".comparing-rightword").text();
        leftWord = leftWord.toLowerCase();
        rightWord = rightWord.toLowerCase();

        var leftWordArray = leftWord.split('');
        var rightWordArray = rightWord.split('');

        if (leftWordArray[0] != rightWordArray[0]) {
            ProgramPlayer.getComparisionAnswerIcon(true);
            ProgramPlayer.comparisionAnswers.push(1);
        } else {
            ProgramPlayer.getComparisionAnswerIcon(false);
            ProgramPlayer.comparisionAnswers.push(0);
        }
        ProgramPlayer.disableComparisionControl();

    },
    getComparisionAnswerIcon: function (isTrue) {
        var filename;
        if (isTrue) {
            filename = "correcticon.png";
        } else {
            filename = "incorrecticon.png";
        }
        $(".ProgramPlayer-box").append("<div class='comparision-answer'><img src='/style library/icons/" + filename + "'></div>");
        setTimeout(() => {
            $(".comparision-answer").remove();
        }, 1000);
    },
    ComparingRight: function () {
        var leftWord = $(".comparing-leftword").text();
        var rightWord = $(".comparing-rightword").text();
        leftWord = leftWord.toLowerCase();
        rightWord = rightWord.toLowerCase();

        var leftWordArray = leftWord.split('');
        var rightWordArray = rightWord.split('');

        if (leftWordArray[3] != rightWordArray[3]) {
            ProgramPlayer.getComparisionAnswerIcon(true);
            ProgramPlayer.comparisionAnswers.push(1);
        } else {
            ProgramPlayer.getComparisionAnswerIcon(false);
            ProgramPlayer.comparisionAnswers.push(0);
        }
        ProgramPlayer.disableComparisionControl();
    },
    disableComparisionControl: function () {
        $(".ProgramPlayer-wrapper .comparing-Left").unbind("click.customEvent").addClass("disabled");
        $(".ProgramPlayer-wrapper .comparing-Right").unbind("click.customEvent").addClass("disabled");
    },
    enableComparisionControl: function () {
        $(".ProgramPlayer-wrapper .comparing-Left").unbind("click.customEvent").bind("click.customEvent", ProgramPlayer.ComparingLeft).removeClass("disabled");
        $(".ProgramPlayer-wrapper .comparing-Right").unbind("click.customEvent").bind("click.customEvent", ProgramPlayer.ComparingRight).removeClass("disabled");
    },
    playSlider: function () {
        ProgramPlayer.slideNext();
        $(this).addClass("ms-hide");
        $("body").addClass("slider-playing");
    },
    playSliderFullscreen: function () {
        //ProgramPlayer.slideNext();
        aba.common.openFullscreen();
        $(".ProgramPlayer-display-background").addClass("fullscreen");
    },
    CloseSliderFullscreen: function () {
        $(".ProgramPlayer-display-background").removeClass("fullscreen");
        aba.common.exitFullScreen();
    },
    slideNext: function () {
        //var numberOfLettersInput = $(".ProgramPlayer-wrapper .numberOfLettersInput").val();
        var numberOfLettersInput = ProgramPlayer.spinnerNumberOfLettersInput.spinner("value");
        var presentationTime = $(".ProgramPlayer-wrapper .presentationTimeInput").val();
        if (ProgramPlayer.wordsListArray && ProgramPlayer.wordsListArray.length && length) {
            clearTimeout(ProgramPlayer.timeoutToShow);
            clearTimeout(ProgramPlayer.timeoutToClear);
            ProgramPlayer.showRandomWord(ProgramPlayer.wordsListArray, +numberOfLettersInput, +presentationTime);

            if (ProgramPlayer.mode == 2) { //comparision
                ProgramPlayer.enableComparisionControl();
            }

        } else {
            alert("Number of Letters can not be empty");
        }
    },
    showRandomWord: function (arr, length, duration) {
        var word;
        if (ProgramPlayer.nextPreparedWord && length == ProgramPlayer.nextPreparedWord.length) {
            word = ProgramPlayer.nextPreparedWord;
        } else {
            word = ProgramPlayer.getRandomWord(arr, length);
        }
        ProgramPlayer.nextPreparedWord = ProgramPlayer.getRandomWord(arr, length);

        if (word) {
            ProgramPlayer.timeoutToShow = setTimeout(() => {
                var html = ProgramPlayer.getRandomWordHtml(word)
                $(".ProgramPlayer-display").removeClass("ms-hide").html(html);
                if (duration) {
                    ProgramPlayer.timeoutToClear = setTimeout(() => {
                        $(".ProgramPlayer-display").addClass("ms-hide");
                    }, duration);
                }
            }, 1000);
        }
    },
    randomWordAttempts: 0,
    getRandomWord: function (arr, length) {
        ProgramPlayer.randomWordAttempts = 0;
        return ProgramPlayer.getRandomWordLogic(arr, length)
    },
    getRandomWordLogic: function (arr, length) {
        if (arr.length > 0) {

            var rangeStart = ProgramPlayer.sliderStartRange, rangeEnd = ProgramPlayer.sliderEndRange;
            if (!rangeStart) {
                rangeStart = 0;
            }
            if (!rangeEnd) {
                rangeEnd = arr.length;
            }

            var random = Math.floor(rangeStart + (Math.random() * (rangeEnd - rangeStart)));
            //var random = Math.floor(Math.random() * arr.length);
            var randomWord = arr[random];
            randomWord = randomWord.trim()
            var randomWordLength = randomWord.length;

            if (randomWordLength == length) {
                return randomWord;
            } else {
                if (ProgramPlayer.randomWordAttempts < 1000) {
                    ProgramPlayer.randomWordAttempts += 1;
                    return ProgramPlayer.getRandomWordLogic(arr, length)
                } else {
                    return null;
                }
            }
        } else {
            alert("Corrupted or empty source file.")
        }
    },
    getRandomWordHtml: function (word) {
        if (ProgramPlayer.mode == 1) {
            return word.trim();
        } else if (ProgramPlayer.mode == 2) {
            var arr = word.split("-").filter(function (i) { return i.trim() });
            return "<div class='comparing-leftword'>" + arr[0] + "</div><div class='comparing-rightword'>" + arr[1] + "</div>";
        }
    }

}
$(document).ready(function () {
    ProgramPlayer.onLoad();
})





