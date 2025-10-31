const prompt = require('prompt-sync')();
let taxis = [
    { id: 1, position: 5, available: true, timeRemaining: 0, totalRides: 0 },
    { id: 2, position: 12, available: true, timeRemaining: 0, totalRides: 0 },
    { id: 3, position: 20, available: true, timeRemaining: 0, totalRides: 0 }
];

let waitingQueue = [];
let requests = [];
let report = [];
let newRequest = {}

function orderTaxi() {
    let userPosition = Number(prompt("Enter your current position: "));
    let rideDuration = Number(prompt("Enter estimated duration: "));
    let whereTo = Number(prompt("enter arrival position: "));
   // let requestTime = Number(prompt("Enter request time (minute): "));

        newRequest = {
        reqId: requests.length + 1,
        position: userPosition,
        duration: rideDuration,
        finalPosition: whereTo,
        //time: requestTime
    };

    requests.push(newRequest);
    assignNearTaxi(newRequest);
    console.log(`request: ${newRequest.reqId} added`);

    if(newRequest.length > 0){
        report.push(newRequest);
    }
};


function assignNearTaxi(request) {
    let nearTaxi = null;
    let minDistance = Infinity;


    for (let i = 0; i < taxis.length; i++) {
        if (taxis[i].available == true) {
            let distance = Math.abs(taxis[i].position - request.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearTaxi = taxis[i];            
            }
        }
    }


    if (nearTaxi !== null) {
        for (let i = 0; i < taxis.length; i++) {
            if(taxis[i].id == nearTaxi.id){
                taxis[i].available = false;
                taxis[i].position = request.position
                taxis[i].timeRemaining = request.duration;
            
                taxis[i].totalRides ++;
            }
        }

        console.log(`Taxi ${nearTaxi.id} assigned to request ${request.reqId}`);
    }
    else {
        console.log("No taxis available. Your request is added to the waiting queue.");
        waitingQueue.push(request);
    }
}

function updateTaxis(request) {
    for (let i = 0; i < taxis.length; i++) {
        if (!taxis[i].available) {
            taxis[i].timeRemaining -= 1;
            if (taxis[i].timeRemaining === 0) {
                taxis[i].available = true;
                taxis[i].position = newRequest.finalPosition;

                console.log(`taxi ${taxis[i].id} is available now`);
            }
        }
    }
}

function simulate() {
    let currentMinute = 0;
    let maxMinutes = 30;

    while (currentMinute < maxMinutes) {
        console.log(`\n--- Minute ${currentMinute} ---`);

        for (let i = 0; i < requests.length; i++) {
            if (requests[i].time === currentMinute) {
                assignNearTaxi(requests[i]);
            }
        }
        updateTaxis();
        for (let i = 0; i < taxis.length; i++) {
            if (taxis[i].available === true && waitingQueue.length > 0) {
                let nextRequest = waitingQueue.shift();
                console.log(`taxi ${taxis[i].id} taking request ${nextRequest.reqId} from the queue.`);
                assignNearTaxi(nextRequest);
            }
        }

        let done = true;

        for (let i = 0; i < taxis.length; i++) {
            if (!taxis[i].available) {
                done = false;
                break;
            }
        }
        if (waitingQueue.length > 0) {
            done = false;
        }
        else if (done && currentMinute > 0) {
            console.log("all ride complaited");
            break;
        }
        currentMinute++;
    }

    finalReport();
}

function finalReport() {
    let totalRides = 0;
    for (let i = 0; i < taxis.length; i++) {

        console.log(`taxi ${taxis[i].id} -- ride : ${taxis[i].totalRides} -- final position : ${taxis[i].position} `)
        totalRides += taxis[i].totalRides;
    }

    console.log("toltal rides: ", totalRides);
}

function availableTaxis() {
    for (let i = 0; i < taxis.length; i++) {
        if (taxis[i].available === true) {
            console.log('taxi id', taxis[i].id, ':', 'taxi position', taxis[i].position, 'taxi status', taxis[i].available);
        }
    }
}

function menu() {

    while (true) {

        console.log("==================================");
        console.log("wellcome smart taxi");
        console.log("==================================\n");
        console.log("1- view avalibels taxis");
        console.log("2- order a taxi");
        console.log("3- start simulate");
        console.log("4- view final report.");
        console.log("0- exit");

        const input = prompt("enter your choice: ");

        if (input === "0") {
            console.log("I hope you enjoyed your ride");
            break;
        }

        switch (input) {
            case "1":
                availableTaxis();
                break;
            case "2":
                orderTaxi();
                break;
            case "3":
                simulate();
                break;
                case "4" :
                    finalReport();
                    break;
            default:
                break;
        }
    }
}

menu()