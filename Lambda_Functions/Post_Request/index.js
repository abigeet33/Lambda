var QUEUE_URL =  "https://sqs.us-west-2.amazonaws.com/860377207667/ServiceQueue.fifo";
var AWS = require('aws-sdk');
//   QUEUE
var sqs = new AWS.SQS({region : 'us_west_2'});
//var output="";

var http = require('http');

var didReceiveMsgFromQueue = false;

exports.handler = function(event, context) {

  	var params = {
    	QueueUrl: QUEUE_URL,
     	MaxNumberOfMessages: 10
  	};

	   	sqs.receiveMessage(params, function(err, data) {
	    	if (err) {
	      		console.log(err, err.stack);
	      		callback(err);
	    	} else {

	    		console.log(data);
	    		if (data.Messages != null) {
	    			didReceiveMsgFromQueue = true;
		    		message = data.Messages[0]
		      		output = message.Body;
		      		// An object of options to indicate where to post to
						var post_options = { 
							host: 'iotscheduler.wtkj2cpjzs.us-west-2.elasticbeanstalk.com',
							//host: 'iotscheduler.mkxdvyuh89.us-west-2.elasticbeanstalk.com',
							port:80,
							path: '/rest/iotservices',
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Content-Length': Buffer.byteLength(output)
							}
						};
						
						// Set up the request
							var req = http.request(post_options, function(res) {
							  console.log('Status: ' + res.statusCode);
							  console.log('Headers: ' + JSON.stringify(res.headers));
							  res.setEncoding('utf8');
							  res.on('data', function (body) {
								console.log('Body: ' + body);
							  });
							});
							req.on('error', function(e) {
							  console.log('problem with request: ' + e.message);
							});
							// write data to request body
							req.write(output);
							req.end();	
						
							 var delParams = {
								QueueUrl: QUEUE_URL,
								ReceiptHandle: message.ReceiptHandle
							};
							
							//delete message from sqs
							sqs.deleteMessage(delParams, function(err, data) {
				        	if (err) {
				        		console.log("Delete from queue error.\nError is: " + err);
				        	} else {
				        		console.log("Delete queue success.");
				        	}
				        });
				} else {
					console.log("data.Message is null.");
				}
		    }
	  	});
			
}