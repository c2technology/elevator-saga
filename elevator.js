{
    init: function(elevators, floors) {
        var delayedUp = []
        var delayedDown = []
        console.clear()
        
        var queue = function(elevator, floorNum){
            if (!elevator.destinationQueue.includes(floorNum){
                elevator.destinationQueue.push(floorNum)
            }
        }
        test("b")
        for (var e = 0; e < elevators.length; e++){
            var elevator = elevators[e]
            test("c")
            console.log("init elevator " + e)
            ////////// ELEVATOR BUTTON PRESSED /////////
            elevator.on("floor_button_pressed", function(floorNum){
                console.log("Elevator: Floor " + floorNum + " added to -> " + this.destinationQueue)
                if (this.destinationDirection() === "stopped"){
                    if (this.currentFloor() < floorNum){
                        console.log("Elevator going UP!")
                    } else {
                        console.log("Elevator going DOWN!")
                    }
                    this.goingUpIndicator(this.currentFloor() < floorNum)
                    this.goingDownIndicator(floorNum < this.currentFloor())
                    if (this.goingUpIndicator()){
                        //add all delayed ups
                    } else {
                        //add all delayed downs
                    }
                }
                if (!this.destinationQueue.includes(floorNum)){
                    console.log("Adding " + floorNum + " -> " + this.destinationQueue)
                    this.destinationQueue.push(floorNum)
                }
                this.destinationQueue.sort()
                if (this.goingDownIndicator()){
                    this.destinationQueue.reverse()
                }
                this.checkDestinationQueue()
                console.log("Elevator: " + this.destinationQueue)
            }) //end floor button pressed
            
            ////////// ELEVATOR IDLE /////////
            // Whenever the elevator is idle (has no more queued destinations) ...
            elevator.on("idle", function() {
                console.log("idle: " + this.destinationQueue)
                //see if we have any delayed things to process
                if (this.goingUpIndicator() && delayedUp.length > 0){
                    console.log("Elevator going UP!")
                    for (var x = 0; x < delayedUp.length; x++){
                        if (!this.destinationQueue.includes(delayedUp[x])){
                            console.log("Adding " + delayedUp[x] + " -> " + this.destinationQueue)
                            this.destinationQueue.push(delayedUp[x])
                        }
                    }
                    delayedUp = []
                    this.destinationQueue.sort()
                } else if (this.goingDownIndicator() && delayedDown.length > 0){
                    this.goingUpIndicator(false)
                    this.goingDownIndicator(true)
                    console.log("Elevator going DOWN!")
                    for (var x = 0; x < delayedDown.length; x++){
                        if (!this.destinationQueue.includes(delayedDown[x])){
                            console.log("Adding " + delayedDown[x] + " -> " + this.destinationQueue)
                            this.destinationQueue.push(delayedDown[x])
                        }
                    }
                    delayedDown = []
                    this.destinationQueue.sort().reverse()
                }
            }) //end idle
            
            ////////// ELEVATOR STOPPED /////////
            elevator.on("stopped_at_floor", function(floorNum){
                //check elevator state and determine if we need to switch directions
                console.log("stopped at " + floorNum + ": " + this.destinationQueue)
                if (floorNum == floors.length -1 && delayedDown.length > 0){
                    this.goingUpIndicator(false)
                    this.goingDownIndicator(true)
                    console.log("Elevator going DOWN!")
                    for (var x = 0; x < delayedDown.length; x++){
                        if (!this.destinationQueue.includes(delayedDown[x])){
                            console.log("Adding " + delayedDown[x] + " -> " + this.destinationQueue)
                            this.destinationQueue.push(delayedDown[x])
                        }
                    }
                    delayedDown = []
                    this.destinationQueue.sort().reverse()
                }
                if (floorNum == 0 && delayedUp.length > 0){
                    this.goingUpIndicator(true)
                    this.goingDownIndicator(false)
                    console.log("Elevator going UP!")
                    for (var x = 0; x < delayedUp.length; x++){
                        if (!this.destinationQueue.includes(delayedUp[x])){
                            console.log("Adding " + delayedUp[x] + " -> " + this.destinationQueue)
                            this.destinationQueue.push(delayedUp[x])
                        }
                    }
                    delayedUp = []
                    this.destinationQueue.sort()
                }
                if (this.destinationQueue.length > 0){
                    console.log("Next stop " + this.destinationQueue[0])
                }
                this.checkDestinationQueue()
            })//end stopped at floor


            for (var f = 0; f < floors.length; f++){
                ////////// FLOOR UP BUTTON PRESSED /////////
                floors[f].on("up_button_pressed", function(){
                    console.log("Call: Floor " + this.floorNum() + " (Up) -> " + elevator.destinationQueue)
                    if (elevator.destinationDirection() === "stopped" ){
                        elevator.goingUpIndicator(true)
                        elevator.goingDownIndicator(false)
                        console.log("Elevator going UP!")
                        if (!elevator.destinationQueue.includes(this.floorNum())){
                            console.log("Adding " + this.floorNum() + " -> " + elevator.destinationQueue)
                            elevator.destinationQueue.push(this.floorNum())
                        }
                    } else if (elevator.goingUpIndicator()){
                        if (this.floorNum() >= elevator.currentFloor()){
                            console.log("Handling Floor " + this.floorNum() + " UP call: " + this.floorNum())
                            if (!elevator.destinationQueue.includes(this.floorNum())){
                                console.log("Adding " + this.floorNum() + " -> " + elevator.destinationQueue)
                                elevator.destinationQueue.push(this.floorNum())
                            }
                        } else if (!delayedUp.includes(this.floorNum())){
                            console.log("Delayed Up: " + this.floorNum() + " -> " + delayedUp)
                            delayedUp.push(this.floorNum())
                            delayedUp.sort()
                        }
                    }
                    elevator.checkDestinationQueue()
                }) //end up_button_pressed
                
                ////////// FLOOR DOWN BUTTON PRESSED /////////
                floors[f].on("down_button_pressed", function(){
                    console.log("Call: Floor " + this.floorNum() + " (Down) -> " + elevator.destinationQueue)
                    if (elevator.destinationDirection() === "stopped"){
                        elevator.goingUpIndicator(false)
                        elevator.goingDownIndicator(true)
                        console.log("Elevator going DOWN!")
                        if (!elevator.destinationQueue.includes(this.floorNum())){
                            console.log("Adding " + this.floorNum() + " -> " + elevator.destinationQueue)
                            elevator.destinationQueue.push(this.floorNum())
                            elevator.checkDestinationQueue()
                        }
                    } else if (elevator.goingDownIndicator()){
                        if (this.floorNum() <= elevator.currentFloor()){
                            if (!elevator.destinationQueue.includes(this.floorNum())){
                                console.log("Handling Floor Down call: " + this.floorNum())
                                console.log("Adding " + this.floorNum() + " to queue -> " + elevator.destinationQueue)
                                elevator.destinationQueue.push(this.floorNum())
                                elevator.checkDestinationQueue()
                            }
                        } else if (!delayedDown.includes(this.floorNum())){
                            console.log("Delayed Down: " + this.floorNum() + " -> " + delayedDown)
                            delayedDown.push(this.floorNum())
                            delayedDown.sort().reverse()
                        }

                    }
                    elevator.checkDestinationQueue()
                }) //end down_button_pressed
            }
        }
    },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
        }
}