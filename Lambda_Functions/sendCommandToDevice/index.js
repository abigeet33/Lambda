var QUEUE_URL =  "https://sqs.us-west-2.amazonaws.com/860377207667/ServiceQueueRsp.fifo";
var AWS = require('aws-sdk');
//   QUEUE
var sqs = new AWS.SQS({region : 'us_west_2'});
var output="";

var didReceiveMsgFromQueue = false;

exports.handler = function(event, context) {

	//   IOT
	//Environment Configuration
	var config = {};
	config.IOT_BROKER_ENDPOINT      = "a3mihr4ed5bm4t.iot.us-west-2.amazonaws.com".toLowerCase();
	config.IOT_BROKER_REGION        = "us-west-2";
	config.IOT_THING_NAME           = "Thing1";
	//Loading AWS SDK libraries
	AWS.config.region = config.IOT_BROKER_REGION;
	//Initializing client for IoT
	var iotData = new AWS.IotData({endpoint: config.IOT_BROKER_ENDPOINT});

  	var params = {
    	QueueUrl: QUEUE_URL,
     	MaxNumberOfMessages: 10
  	};

  	//while (!didReceiveMsgFromQueue) {
  	//	console.log("Here I am again.\n");
	   	sqs.receiveMessage(params, function(err, data) {
	    	if (err) {
	      		console.log(err, err.stack);
	      		callback(err);
	    	} else {
	    		//didReceiveMsgFromQueue = true;
	    		console.log(data);
	    		if (data.Messages != null) {
	    			didReceiveMsgFromQueue = true;
		    		message = data.Messages[0]
		      		output = message.Body;
		      		jsonOutput = JSON.parse(output);
		      		console.log('data from queue is:',output);
		      		var payloadObj={ "state":
			        	{ "desired":
			            	{"command": jsonOutput}
			        	}
			    	};

				    //Prepare the parameters of the update call
				    var paramsUpdate = {
				        "thingName" : config.IOT_THING_NAME,
				        "payload" : JSON.stringify(payloadObj)
				    };


				    //Update Device Shadow
				    iotData.updateThingShadow(paramsUpdate, function(err, data) {
				      if (err){
				        //Handle the error here
				        console.log("Errors")
				        console.log(err)
				      } else {
				        console.log("Success")
				        console.log(data);

				        var delParams = {
		  					QueueUrl: QUEUE_URL,
		  					ReceiptHandle: message.ReceiptHandle
		  				};
		  				///*
				        sqs.deleteMessage(delParams, function(err, data) {
				        	if (err) {
				        		console.log("Delete from queue error.\nError is: " + err);
				        	} else {
				        		console.log("Delete queue success.");
				        	}
				        });
				      }    
				    });
				} else {
					console.log("data.Message is null.");
				}
		    }
	  	});
	
}