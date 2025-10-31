// Smart Taxi Dispatcher (English)
// Run with: node index.js
const prompt = require('prompt-sync')();

// -------------------- Initial data --------------------
let taxis = [
    { id: 1, position: 5, available: true, timeRemaining: 0, totalRides: 0, currentRideDestination: null },
    { id: 2, position: 12, available: true, timeRemaining: 0, totalRides: 0, currentRideDestination: null },
    { id: 3, position: 20, available: true, timeRemaining: 0, totalRides: 0, currentRideDestination: null }
];

// Example requests given in the problem statement:
let requests = [
    { reqId: 1, position: 10, duration: 3, time: 0, handled: false },
    { reqId: 2, position: 3, duration: 4, time: 2, handled: false },
    { reqId: 3, position: 18, duration: 2, time: 4, handled: false },
    { reqId: 4, position: 7, duration: 5, time: 5, handled: false }
];

let waitingQueue = []; // FIFO queue, we will remove first element manually (no shift())

// -------------------- Functions --------------------

// Find nearest available taxi and assign the request.
// Returns true if assigned, false if no taxi available (request should be queued).
function assignNearestAvailableTaxi(request) {
    let nearestTaxi = null;
    let minDistance = 999;

    for (let i = 0; i < taxis.length; i++) {
        if (taxis[i].available) {
            let distance = Math.abs(taxis[i].position - request.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestTaxi = taxis[i];
            }
        }
    }

    if (nearestTaxi !== null) {
        nearestTaxi.available = false;
        nearestTaxi.timeRemaining = request.duration;
        nearestTaxi.currentRideDestination = request.position;
        nearestTaxi.totalRides += 1;
        console.log(`→ Request ${request.reqId} at position ${request.position} → Taxi ${nearestTaxi.id} assigned (distance: ${minDistance})`);
        return true;
    } else {
        // No taxi available
        console.log(`→ Request ${request.reqId} at position ${request.position} → All taxis busy → added to waiting queue.`);
        waitingQueue.push(request);
        return false;
    }
}

// Decrement timeRemaining for busy taxis; free taxis whose timeRemaining reaches 0.
function updateTaxis() {
    for (let i = 0; i < taxis.length; i++) {
        if (!taxis[i].available) {
            taxis[i].timeRemaining -= 1;
            if (taxis[i].timeRemaining <= 0) {
                // Ride finished
                taxis[i].available = true;
                // Move taxi to destination of last ride
                if (taxis[i].currentRideDestination !== null) {
                    taxis[i].position = taxis[i].currentRideDestination;
                    taxis[i].currentRideDestination = null;
                }
                console.log(`→ Taxi ${taxis[i].id} finished ride and is now available (position: ${taxis[i].position}).`);
            }
        }
    }
}

// Handle waiting queue: try to assign the first queued request to available taxis.
// Remove first queue element manually (no shift()) when assigned.
function handleWaitingQueue() {
    // Keep trying while there is at least one available taxi and queue is not empty
    let madeAssignment = true;
    while (madeAssignment && waitingQueue.length > 0) {
        madeAssignment = false;

        // Find any available taxi
        let availableTaxiExists = false;
        for (let t = 0; t < taxis.length; t++) {
            if (taxis[t].available) { availableTaxiExists = true; break; }
        }
        if (!availableTaxiExists) break;

        // Take the first queued request without using shift()
        let firstRequest = waitingQueue[0];
        if (!firstRequest) break;

        // Attempt to assign it
        // Note: assignNearestAvailableTaxi will push back to waiting queue if no taxi; but we already checked availability
        assignNearestAvailableTaxi(firstRequest);

        // Remove first element manually by shifting elements left
        for (let j = 0; j < waitingQueue.length - 1; j++) {
            waitingQueue[j] = waitingQueue[j + 1];
        }
        waitingQueue.length = waitingQueue.length - 1;

        madeAssignment = true;
    }
}

// Print the final report
function printFinalReport(totalSimulatedMinutes) {
    console.log("\n--- Final Report ---");
    for (let i = 0; i < taxis.length; i++) {
        console.log(`Taxi ${taxis[i].id}: ${taxis[i].totalRides} rides, position ${taxis[i].position}`);
    }
    // Count total rides:
    let totalRides = 0;
    for (let i = 0; i < taxis.length; i++) totalRides += taxis[i].totalRides;
    console.log(`Total rides: ${totalRides}`);
    console.log(`Total simulated time: ${totalSimulatedMinutes} minutes`);
}

// Allows user to add a new request interactively
function addRequestFromUser() {
    let userPosition = Number(prompt("Enter request position (number): "));
    let duration = Number(prompt("Enter estimated duration (minutes): "));
    let time = Number(prompt("Enter request arrival time (minute): "));

    let newReqId = 1;
    if (requests.length > 0) {
        // find highest reqId and add 1 to avoid collisions
        let maxId = 0;
        for (let i = 0; i < requests.length; i++) {
            if (requests[i].reqId > maxId) maxId = requests[i].reqId;
        }
        newReqId = maxId + 1;
    }

    let newRequest = { reqId: newReqId, position: userPosition, duration: duration, time: time, handled: false };
    requests.push(newRequest);
    console.log(`Request ${newReqId} added (pos=${userPosition}, duration=${duration}, time=${time}).`);
}

// Run the minute-by-minute simulation.
// The loop continues until: all requests handled (either assigned or queued and completed), no busy taxis, and waiting queue empty.
// A safety maxMinutes prevents infinite loops.
function runSimulation() {
    console.log("\n=== Starting simulation ===");

    let currentMinute = 0;
    const maxMinutes = 1000; // safety cap
    let lastActivityMinute = 0;

    while (currentMinute <= maxMinutes) {
        console.log(`\nMinute ${currentMinute}:`);

        // 1) assign requests that arrive at this minute (requests not yet handled)
        for (let i = 0; i < requests.length; i++) {
            let req = requests[i];
            if (!req.handled && req.time === currentMinute) {
                // Try to assign immediately
                let assigned = assignNearestAvailableTaxi(req);
                // If assigned, mark handled; if queued, still mark handled=false because it's in waitingQueue (we rely on waitingQueue)
                if (assigned) {
                    req.handled = true;
                } else {
                    // queued: mark handled true so it is not re-processed from requests array
                    req.handled = true;
                }
                lastActivityMinute = currentMinute;
            }
        }

        // 2) update taxis (decrease timeRemaining and free taxis)
        updateTaxis();

        // 3) if any taxi is now available, try to assign waiting queue requests
        handleWaitingQueue();

        // 4) Check termination condition:
        // - All requests from requests[] are marked handled (they are either assigned or put in waitingQueue)
        // - waitingQueue is empty
        // - all taxis are available (no busy taxi)
        let allHandled = true;
        for (let i = 0; i < requests.length; i++) {
            if (!requests[i].handled) { allHandled = false; break; }
        }
        let anyBusyTaxi = false;
        for (let i = 0; i < taxis.length; i++) {
            if (!taxis[i].available) { anyBusyTaxi = true; break; }
        }

        if (allHandled && waitingQueue.length === 0 && !anyBusyTaxi && currentMinute > 0) {
            console.log("\nAll rides completed.");
            printFinalReport(currentMinute);
            break;
        }

        // Safety: if nothing happened for many minutes and there are no future requests, end simulation
        // (Detect no future unhandled requests)
        let futureUnhandledExists = false;
        for (let i = 0; i < requests.length; i++) {
            if (!requests[i].handled && requests[i].time > currentMinute) { futureUnhandledExists = true; break; }
        }
        if (!futureUnhandledExists && waitingQueue.length === 0 && !anyBusyTaxi && allHandled) {
            // No pending work
            printFinalReport(currentMinute);
            break;
        }

        // Increment time
        currentMinute += 1;
        if (currentMinute > maxMinutes) {
            console.log("\nReached maximum simulation time limit.");
            printFinalReport(currentMinute);
            break;
        }
    }
}

// -------------------- Simple menu --------------------
function printTaxis() {
    console.log("\nTaxis:");
    for (let i = 0; i < taxis.length; i++) {
        console.log(`Taxi ${taxis[i].id} | position: ${taxis[i].position} | available: ${taxis[i].available} | timeRemaining: ${taxis[i].timeRemaining} | totalRides: ${taxis[i].totalRides}`);
    }
}

function printRequests() {
    console.log("\nAll requests:");
    for (let i = 0; i < requests.length; i++) {
        console.log(`Request ${requests[i].reqId} | pos: ${requests[i].position} | dur: ${requests[i].duration} | time: ${requests[i].time} | handled: ${requests[i].handled}`);
    }
    if (waitingQueue.length > 0) {
        console.log("\nWaiting queue (in order):");
        for (let i = 0; i < waitingQueue.length; i++) {
            console.log(`  Queue[${i}] -> Request ${waitingQueue[i].reqId} | pos: ${waitingQueue[i].position} | dur: ${waitingQueue[i].duration}`);
        }
    }
}

function menu() {
    while (true) {
        console.log("\n==============================");
        console.log("Smart Taxi Dispatcher - Menu");
        console.log("==============================");
        console.log("1 - Show taxis");
        console.log("2 - Add a request (interactive)");
        console.log("3 - Start simulation");
        console.log("4 - Show requests and waiting queue");
        console.log("0 - Exit");

        let choice = prompt("Enter your choice: ");
        if (choice === "0") {
            console.log("Goodbye!");
            break;
        } else if (choice === "1") {
            printTaxis();
        } else if (choice === "2") {
            addRequestFromUser();
        } else if (choice === "3") {
            runSimulation();
        } else if (choice === "4") {
            printRequests();
        } else {
            console.log("Invalid option. Try again.");
        }
    }
}

// start
menu();
