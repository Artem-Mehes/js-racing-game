const score = document.querySelector('#score'),
    area = document.querySelector('#area'),
    buttons = document.querySelector('.buttons'),
    record = document.querySelector('#record'),
    resetRecordBtn = document.querySelector('#reset-record');

const car = document.createElement('div');
car.classList.add('car');

const ENEMIES_COUNT = 1;
const ELEM_HEIGHT = 100;

const storageRecord = localStorage.getItem('record');

area.style.height = 
    Math.floor(document.documentElement.clientHeight / ELEM_HEIGHT) * ELEM_HEIGHT;

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
    ArrowLeft: false
};

const settings = {
    start: false,
    score: 0,
    speed: 0,
    traffic: 0,
    level: 0
};

let level = settings.level;

function loadStorageRecord() {
    if (storageRecord) {
        record.textContent = storageRecord;
    } else {
        localStorage.setItem('record', 0);
        record.textContent = 0;
    }
}

function getElementsAmount(height) {
    return area.offsetHeight / height + 1;
}

function setRecord() {
    if (+score.textContent > storageRecord) {
        record.textContent = score.textContent;
        localStorage.setItem('record', score.textContent);
    }
}

function resetRecord() {
    localStorage.clear();
    record.textContent = 0;
}

function startNewGame(e) {
    const button = e.target.closest('button');
    if (!button) return;
    const difficulty = button.id;

    switch(difficulty) {
        case 'easy':
            settings.speed = 4;
            settings.traffic = 4;
            break;
        case 'medium':
            settings.speed = 6;
            settings.traffic = 3;
            break;
        case 'hard':
            settings.speed = 8;
            settings.traffic = 2;
            break;
    }

    buttons.classList.add('hide');
    resetRecordBtn.classList.add('hide');
    area.innerHTML = '';
    settings.score = 0;

    for (let i = 0; i < getElementsAmount(ELEM_HEIGHT); i++) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.height = ELEM_HEIGHT / 2 + 'px';
        line.style.top = i * ELEM_HEIGHT + 'px';
        line.y = i * ELEM_HEIGHT;
        area.append(line);
    }

    for (let i = 0; i < getElementsAmount(ELEM_HEIGHT * settings.traffic); i++) {
        const enemy = document.createElement('div');
        const enemyImg = Math.floor(Math.random() * ENEMIES_COUNT) + 1;

        enemy.classList.add('enemy');
        const periodEnemy = -ELEM_HEIGHT * settings.traffic * (i + 1);
        enemy.y = periodEnemy < 100 ? -100 * settings.traffic * (i + 1) : periodEnemy;
        enemy.style.top = enemy.y + 'px';
        enemy.style.background = `url(../image/enemy${enemyImg}.png) center / cover no-repeat`;
        area.append(enemy);
        enemy.style.left = Math.floor(Math.random() * (area.offsetWidth - enemy.offsetWidth)) + 'px';
    }

    area.append(car);
    car.style.left = area.offsetWidth / 2 - car.offsetWidth / 2;
    car.style.top = 'auto';
    settings.x = car.offsetLeft;
    settings.y = car.offsetTop;
    settings.start = true;
    requestAnimationFrame(playGame);
}

function playGame() {
    settings.level = Math.floor(settings.score / 2000);

    if (settings.level !== level) {
        level = settings.level;
        settings.speed += 1;
    }

    if (settings.start) {
        settings.score += settings.speed;
        score.textContent = settings.score;
        roadMove();
        enemiesMove();

        if (keys.ArrowLeft && settings.x > 0) {
            settings.x -= settings.speed;
        }
        if (keys.ArrowRight && settings.x < (area.offsetWidth - car.offsetWidth)) {
            settings.x += settings.speed;
        }
        if (keys.ArrowDown && settings.y < (area.offsetHeight - car.offsetHeight)) {
            settings.y += settings.speed;
        }
        if (keys.ArrowUp && settings.y > 0) {
            settings.y -= settings.speed;
        }
        
        car.style.left = settings.x + 'px';
        car.style.top = settings.y + 'px';

        requestAnimationFrame(playGame);
    }
}

function startMove(e) {
    if ( keys.hasOwnProperty(e.key) ) {
        e.preventDefault();
        keys[e.key] = true;
    }
}

function stopMove(e) {
    if ( keys.hasOwnProperty(e.key) ) {
        e.preventDefault();
        keys[e.key] = false;
    }
}

function roadMove() {
    const lines = document.querySelectorAll('.line');

    lines.forEach(line => {
        line.y += settings.speed;
        line.style.top = line.y + 'px';

        if (line.y >= area.offsetHeight) {
            line.y = -ELEM_HEIGHT;
        }
    });
}

function enemiesMove() {
    const enemies = document.querySelectorAll('.enemy');

    enemies.forEach(enemy => {
        const carCoords = car.getBoundingClientRect();
        const enemyCoords = enemy.getBoundingClientRect();

        if (carCoords.top + 5 <= enemyCoords.bottom &&
            carCoords.right - 5 >= enemyCoords.left &&
            carCoords.left + 5 <= enemyCoords.right &&
            carCoords.bottom - 5 >= enemyCoords.top) {
            settings.start = false;
            setRecord();
            buttons.classList.remove('hide');
            resetRecordBtn.classList.remove('hide');
        }

        enemy.y += settings.speed / 2;
        enemy.style.top = enemy.y + 'px';

        if (enemy.y >= area.offsetHeight) {
            enemy.y = -ELEM_HEIGHT * settings.traffic;
            enemy.style.left = Math.floor(Math.random() * (area.offsetWidth - enemy.offsetWidth)) + 'px';
        }

    });
}

loadStorageRecord();

document.addEventListener('keydown', startMove);
document.addEventListener('keyup', stopMove);
buttons.addEventListener('click', startNewGame);
resetRecordBtn.addEventListener('click', resetRecord);