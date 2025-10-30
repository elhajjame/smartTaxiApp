const prompt = require('prompt-sync')();
let taxis = [
    { id: 1, position: 5, available: true, timeRemaining: 0, totalRides: 0 },
    { id: 2, position: 12, available: true, timeRemaining: 0, totalRides: 0 },
    { id: 3, position: 20, available: true, timeRemaining: 0, totalRides: 0 }
];

let waitingQueue = [];

function orderTaxi() {
    let requests = [{ reqId: requests.length + 1, position: userPosition, duration: rideDuration, time: requestTime }];

    let userPosition = Number(prompt("Enter your current position: "));
    let rideDuration = Number(prompt("Enter estimated duration: "));
    let requestTime = Number(prompt("Enter request time (minute): "));

    let newRequest = {
        reqId: requests.length + 1,
        position: userPosition,
        duration: rideDuration,
        time: requestTime
    };

    requests.push(newRequest);
};

function assignNearTaxi(request) {
    let nearTaxi = null;
    let minDistance = 200;

    for (let i = 0; i < taxis.length; i++) {
        let distance = Math.abs(taxis[i].position - request.position);
        if (taxis[i].available == true) {
            if (minDistance > distance) {
                minDistance = distance;
                nearTaxi = taxis[i];
            }
        }
    }


    if (nearTaxi !== null) {
        nearTaxi.available = false;
        nearTaxi.timeRemaining = request.duration;
        nearTaxi.position = request.position;

        nearTaxi.totalRides += 1;

        console.log(`taxi : ${nearTaxi.id} assined to ${request.reqId}`)
    } else {
        console.log("no taxis available you are in waitingQueue");
        waitingQueue.push(request);
    }
}

function updateTaxis() {
    for (let i = 0; i < taxis.length; i++) {
        if (!taxis[i].available) {
            taxis[i].timeRemaining -= 1;
            if (taxis[i].timeRemaining === 0) {
                taxis[i].available = true;

                console.log(`taxi ${taxis[i].id} is available now`);
            }
        }
    }
}

function just(){
    let currentMinute = 0;
    let maxMinutes = 30;

    while(currentMinute < maxMinutes){
        for(let i = 0; i < requests.length; i++ ){
            if(requests[i].time === currentMinute){
                assignNearTaxi(requests[i]);
            }
        }

        updateTaxis();

        for(let i = 0; i < taxis.length; i++){
            if(taxis[i].available === true && waitingQueue.length > 0){
                let nextRequest = waitingQueue.shift();
                console.log(`taxi &{taxi[i].id} taking request ${nextRequest.reqId} from the queue. `)
            }
        }

        let done = true;
    }


}

function availableTaxis() {
    for (let i = 0; i < taxis.length; i++) {
        if (taxis[i].available === true) {
            console.log('taxi id', taxis[i].id, ':', 'taxi status', taxis[i].available);
        }
    }
}


function menu() {

    while (true) {

        console.log("==================================\n");
        console.log("wellcome smart taxi");
        console.log("==================================\n");
        console.log("1- view avalibels taxis : ");
        console.log("2-order a taxi : ");
        console.log("3- start simulate");
        console.log("4- view find request");
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
                orderTaxi()
                break;
            case "3":
                updateTaxis();
                break;
            case "4":

                break;
            case "0":

            default:
                break;
        }
    }
}

menu()