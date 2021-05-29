let MainWidth;
let GameWidth;
let Bombs;
let BtnWidth;
let IsGameStarted = false;
let GamePadding = 10;
let Btns = [];
let btnBombs = [];

//[
//  [],
//  [],
//]
//Example : Btns[Y-1][X-1] means : button at X,Y

$(document).ready(function () {

    GetWidth()

    $("#btnStartGame").click(async function () {

        //GameLen = parseInt($("#game-len").val());
        //Bombs = parseInt($("#bombs").val());


        //if (!IsGameStarted) {
        //    IsGameStarted = true;
        //    this.innerHTML = "ReStart Game";
        //    $(this).removeClass("btn-warning")
        //    $(this).addClass("btn-primary");
        //}

        await CreateNewGame(this);

    });

    $("#game-len").change(function () {

        let newVal = $(this).val();

        $("#bombs").val(newVal * 2);

    });

    $("#bombs").change(function () {

        let bombsCount = $("#game-len").val() ** 2;

        let max = Math.floor(bombsCount * 0.75);

        if (this.value > max) {
            this.value = max;
        } else if (this.value < 1) {
            this.value = 1;
        }

    });

});


async function GetWidth() {
    MainWidth = parseInt($(document).innerWidth());

    if (MainWidth >= 720) {
        GameWidth = 720 * 0.85;
    } else {
        GameWidth = parseInt(MainWidth) * 0.85;
    }
}

async function CreateNewGame(btnStart) {
    GameLen = parseInt($("#game-len").val());
    Bombs = parseInt($("#bombs").val());

    if (!IsGameStarted) {
        IsGameStarted = true;
        btnStart.innerHTML = "ReStart Game";
        $(btnStart).removeClass("btn-warning")
        $(btnStart).addClass("btn-primary");
    }

    await ClearGame();

    let btnRow = [];
    for (var i = 1; i <= GameLen ** 2; i++) {
        var btn = document.createElement("button");


        $("#game")
            .append(btn)
            .innerWidth(GameWidth + (GamePadding * 2))
            .innerHeight(GameWidth + (GamePadding * 2));

        let btnWidth = (GameWidth / GameLen);
        let btnX = btnRow.length;
        let btnY = Btns.length;
        let top = (btnY * btnWidth) + GamePadding;
        let left = (btnX * btnWidth) + GamePadding;
        let fontSize;
        switch (GameLen) {
            case 8:
                fontSize = 25;
                break;

            case 16:
                fontSize = 20;
                break;

            case 20:
                fontSize = 17;
                break;

            case 26:
                fontSize = 15;
                break;

            case 32:
                fontSize = 13;
                break;

            case 36:
                fontSize = 10;
                break;
            default:
        }

        if (MainWidth < 550) {
            fontSize *= 0.8;
        }

        $(btn)
            .addClass("gameButton")
            .innerHeight(btnWidth)
            .innerWidth(btnWidth)
            .attr("Y", btnY)
            .attr("X", btnX)
            .attr("Bomb", false)
            .attr("Txt", "")
            .css({
                "top": top,
                "left": left,
                "font-size": fontSize + "px"
            });

        $(btn).click(async function () {
            await GameBtnClicked(this);
            //$(this)
            //    .addClass("gameButtonClicked")
            //    .attr("disabled", true);

            //if ($(this).attr("Bomb") == "true") {

            //    $(this)
            //        .html("")
            //        .append('<img src="images/bomb.jpg" class="bomb-image">');

            //} else {
            //    let num = parseInt($(this).attr('Txt'));
            //    if (!isNaN(num)) {
            //        $(this)
            //            .html(num)
            //            .addClass("color" + num);
            //    }
            //}
        });


        btnRow.push(btn);

        if (btnRow.length == GameLen) {
            Btns.push(btnRow);
            btnRow = [];
        }
    }

    PlantBombs();
}

async function GameBtnClicked(btn) {
    if (!IsGameStarted) {
        return;
    }

    $(btn)
        .addClass("gameButtonClicked")
        .attr("disabled", true);

    if ($(btn).attr("Bomb") == "true") {
        //bomb block : loser
        IsGameStarted = false;
        $(btn)
            .html("")
            .append('<img src="images/bomb-red.jpg" class="bomb-image">');

        PlaySound("SFX/bomb.wav");


        for (let i = 0; i < btnBombs.length; i++) {
            let bomb = btnBombs[i];
            if (bomb == btn) {
                continue;
            }
            $(bomb)
                .html("")
                .append('<img src="images/bomb.jpg" class="bomb-image">');
        }

    } else {
        let num = parseInt($(btn).attr('Txt'));
        if (!isNaN(num)) {
            //number block
            PlaySound("SFX/number.wav");

            $(btn)
                .html(num)
                .addClass("color" + num);
        } else {
            //empty block
            PlaySound("SFX/empty.wav");
            await EmptyBlockClicked(btn);
        }
    }

}

async function PlaySound(src) {
    new Audio(src).play();
}

async function EmptyBlockClicked(Btn) {

    let btnX = parseInt($(Btn).attr("X"));
    let btnY = parseInt($(Btn).attr("Y"));


    for (let i = btnY - 1; i <= btnY + 1; i++) {
        for (let j = btnX - 1; j <= btnX + 1; j++) {
            if (i - btnY == 0 && j - btnX == 0) {
                continue;
            }
            if (i < 0 || i >= GameLen || j < 0 || j >= GameLen) {
                continue;
            }

            let btn = Btns[i][j];

            $(btn)
                .addClass("gameButtonClicked")
                .attr("disabled", true);

            let num = $(btn).attr("Txt");
            if (num == "") {

                //Code

            } else {
                $(btn)
                    .html(num)
                    .addClass("color" + num);
            }

        }
    }
}


function PlantBombs() {
    for (let i = 0; i < Bombs; i++) {
        let btn;
        while (true) { //get button with no bomb
            let x = RandInt(0, GameLen - 1);
            let y = RandInt(0, GameLen - 1);
            btn = Btns[y][x];

            if ($(btn).attr("Bomb") == "false") {
                break;
            }
        }

        $(btn)
            .attr("Bomb", true)
            .attr("Txt", "");

        let btnX = parseInt($(btn).attr("X"));
        let btnY = parseInt($(btn).attr("Y"));

        SetBlocksAroundBomb(btnX, btnY);
        btnBombs.push(btn);
    }
}

function SetBlocksAroundBomb(X, Y) {
    for (let i = Y - 1; i <= Y + 1; i++) {
        for (let j = X - 1; j <= X + 1; j++) {
            if (i - Y == 0 && j - X == 0) {
                continue;
            }
            if (i < 0 || i >= GameLen || j < 0 || j >= GameLen) {
                continue;
            }

            let btn = Btns[i][j];

            if ($(btn).attr("Bomb") == "true") {
                continue;
            }

            let num = parseInt($(btn).attr("Txt"));

            if (isNaN(num)) {
                $(btn).attr("Txt", 1)
            } else {
                $(btn).attr("Txt", num + 1)
            }

        }
    }
}

function RandInt(Start, End) {
    return Math.floor(Math.random() * End + 1) + (Start - 1);
}

async function ClearGame() {
    $("#game").html("");
    Btns = [];
    btnBombs = [];
}