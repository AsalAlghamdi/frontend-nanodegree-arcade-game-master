function wait(callback){
    setTimeout(function(){
        console.log("Hello");
        callback(); // Here we write the callback function 
    }, 500);
}

function print(){
    console.log("Asal");
}

wait(print);