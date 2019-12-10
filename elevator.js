{
    init: function(elevators, floors) {
        var delayedUp = []
        var delayedDown = []
        console.clear()

        var updateQueue = function(up, down, currentFloor, queue, floorNum){
            if (up){
                if (floorNum < currentFloor){
                    if (!delayedUp.includes(floorNum)){
                        delayedUp.push(floorNum)
                        console.log("Delayed Floor Up call for " + floorNum + " -> " + delayedUp)
                    }
                } else {
                    console.log("Floor Up call for " + floorNum)
                }
            } else if (down) {
                if (floorNum > currentFloor){
                    if (!delayedDown.includes(floorNum)){
                        delayedDown.push(floorNum)
                        console.log("Delayed Floor Down call for " + floorNum + " -> " + delayedDown)
                    }
                } else {
                    console.log("Floor Down call for " + floorNum + " handled -> " + queue)
                }
            } else if (!queue.includes(floorNum)){
                queue.push(floorNum)
                console.log("Floor " + floorNum + " handled -> " + queue)
            }
            return queue
        }

        for (var e = 0; e < elevators.length; e++){
            var elevator = elevators[e]
            console.log("init elevator " + e)
            ////////// ELEVATOR BUTTON PRESSED /////////
            elevator.on("floor_button_pressed", function(floorNum){
                console.log("Elevator: Floor " + floorNum + " added to -> " + this.destinationQueue)
                elevator.goingUpIndicator(elevator.currentFloor() < floorNum)
                elevator.goingDownIndicator(floorNum < elevator.currentFloor())
                this.destinationQueue = updateQueue(this.goingUpIndicator(), this.goingDownIndicator(), this.currentFloor(), this.destinationQueue, floorNum)
                elevator.destinationQueue.sort()
                if (elevator.goingDownIndicator()){
                    elevator.destinationQueue.sort().reverse()
                }
                elevator.checkDestinationQueue()
            }) //end floor button pressed

            ////////// ELEVATOR IDLE /////////
            elevator.on("idle", function() {
                if (delayedUp.length > 0){
                    console.log("Handling delayed up...")
                    this.goingUpIndicator(true)
                    this.goingDownIndicator(false)
                } else if (delayedDown.length > 0){
                    console.log("Handling delayed down...")
                    this.goingUpIndicator(false)
                    this.goingDownIndicator(true)
                } else {
                    console.log("idle...")
                    this.goingUpIndicator(false)
                    this.goingDownIndicator(false)
                }
                if (this.goingDownIndicator()){
                    console.log("Delayed Down: " + delayedDown)
                    for (var x = 0; x < delayedDown.length; x++){
                        this.destinationQueue.push(delayedDown[x])
                    }
                    this.destinationQueue.sort().reverse()
                    console.log("Updated queue: " + this.destinationQueue)
                    console.log("Delayed down cleared!")
                    delayedDown = []
                    
                }
                if (this.goingUpIndicator()){
                    console.log("Delayed Up: " + delayedUp)
                    for (var x = 0; x < delayedUp.length; x++){
                        this.destinationQueue.push(delayedUp[x])
                    }
                    this.destinationQueue.sort()
                    console.log("Updated queue: " + this.destinationQueue)
                    console.log("Delayed up cleared!")
                    delayedUp = []
                }
                this.checkDestinationQueue()
            }) //end idle

            for (var f = 0; f < floors.length; f++){
                ////////// FLOOR UP BUTTON PRESSED /////////
                floors[f].on("up_button_pressed", function(){
                    console.log("Call: Floor " + this.floorNum() + " (Up) -> " + elevator.destinationQueue)
                    if (elevator.destinationDirection() === "stopped"){
                        elevator.goingUpIndicator(true)
                        elevator.goingDownIndicator(false)
                    }
                    elevator.destinationQueue = updateQueue(elevator.goingUpIndicator(), elevator.goingDownIndicator(), elevator.currentFloor(), elevator.destinationQueue, this.floorNum())
                    elevator.checkDestinationQueue()
                }) //end up_button_pressed

                ////////// FLOOR DOWN BUTTON PRESSED /////////
                floors[f].on("down_button_pressed", function(){
                    console.log("Call: Floor " + this.floorNum() + " (Down) -> " + elevator.destinationQueue)
                    if (elevator.destinationDirection() === "stopped"){
                        elevator.goingUpIndicator(false)
                        elevator.goingDownIndicator(true)
                    }
                    elevator.destinationQueue = updateQueue(elevator.goingUpIndicator(), elevator.goingDownIndicator(), elevator.currentFloor(), elevator.destinationQueue, this.floorNum())
                    elevator.checkDestinationQueue()
                }) //end down_button_pressed
            }
        }
    },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
        }
}