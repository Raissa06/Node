/**
	@author: Raissa Morgado
**/
// imports HTTP module and sets default listening port
var http = require('http');
var https = require('https');
var originalRequest;
var jsonBodyResp;
var boletoResponse;

//PORT = 8000;
 
// defines request handler function and prints request data
function handleRequest(request, response) {
	// response.end('It works! Requested url was: ' + request.url);
	 //if (request.method == 'POST') {
		 request.on('data', function (chunk) {
			 console.log("Received body data:");
			 console.log(chunk.toString());

			 originalRequest =  JSON.parse(chunk);

			 var jsonBody = JSON.stringify({  
			    "MerchantOrderId":"2014111706",
			    "Customer":
			    {  
			        "Name":"Comprador Teste"     
			    },
			    "Payment":
			    {  
			        "Type":"Boleto",
			        "Amount":15700,
			        "Provider":"Simulado",
			        "Address": "Rua Teste",
			        "BoletoNumber": "123",
			        "Assignor": "Empresa Teste",
			        "Demonstrative": "Desmonstrative Teste",
			        "ExpirationDate": "2015-01-05",
			        "Identification": "11884926754",
			        "Instructions": "Aceitar somente até a data de vencimento, após essa data juros de 1% dia."
			    }
			});

			var postheaders = {
			    'Content-Type' : 'application/json',
			    'MerchantId' : '207fa37c-b7ba-47a2-b39a-9ccf1d5e8a6e',
		        'MerchantKey' : 'RBYYGFNFBEZYUEOFXDBONUWILCAXTRGCHHOJVUPG'
			};

			var optionspost = {
			    host : 'apisandbox.braspag.com.br',
			    path : '/v2/sales/',
			    method : 'POST',
			    headers : postheaders
			};

			// do the POST call
			var reqPost = https.request(optionspost, function(res) {
			    console.log("statusCode: ", res.statusCode);
			 
			    res.on('data', function(responseBoleto) {
			        console.info('POST result:\n');
			        process.stdout.write(responseBoleto);
			        console.info('\n\nPOST completed');

			        boletoResponse = JSON.parse(responseBoleto);

			        jsonBodyResp = JSON.stringify({
							    "merchantTransactionTimestamp": "1447807667046",
							    "currencyCode": originalRequest.currencyCode,
							    "transactionId": originalRequest.transactionId,
							    "PONumber": originalRequest.PONumber,
							    "referenceNumber": originalRequest.referenceNumber,
							    "organizationId": "or-300007",
							    "amount": "000000002999",
							    "transactionType": "AUTHORIZE",
							    "authorizationResponse": {
							        "hostTransactionId": "HOST-TRANSACTION-ID",
							        "responseCode": "1000",
							        "responseReason": "1002",
							        "responseDescription": "Valid PO Number",
							        "merchantTransactionId": "passarela"
							    },			    
							    "additionalProperties": {
						           "boletoURL": boletoResponse.Payment.Url
						        },
						        "customProperties": {
							        "boletoURL": boletoResponse.Payment.Url
							    },	
      							"externalProperties": ["boletoURL"],
							    "transactionTimestamp": originalRequest.transactionTimestamp,
							    "paymentMethod": "invoice",
							    "orderId": originalRequest.orderId,
							    "gatewayId": originalRequest.gatewayId
					});	


					//============ATUALIZA CUSTOM FIELDS==================
					
					var occPostheaders = {
					    'Content-Type' : 'application/json',
					    'Authorization' : 'Bearer '
					};
					var occJsonBody = JSON.stringify({
						"idPropostaSisamil": "SIS123",
						"boletoURL": boletoResponse.Payment.Url
					});

					var occOptionspost = {
					    host : 'ccadmin-test-z53a.oracleoutsourcing.com',
					    path : '/ccadmin/v1/orders/' + originalRequest.orderId,
					    method : 'PUT',
					    headers : occPostheaders
					};

					var occRequest = https.request(occOptionspost, function(occRes) {
					    console.log("statusCode: ", occRes.statusCode);
					 
					    occRes.on('data', function(chunkOCC) {
					        //console.info('PUT result:\n');
					        //process.stdout.write(chunkOCC);
					        console.info('\n\nPUT completed');					        					
						});
						occRes.on('error', function(e) {
					        console.error(e);						
						});
					});	
					occRequest.write(occJsonBody);
					occRequest.end();
					occRequest.on('error', function(e) {
					    console.error(e);
					});
					//============ATUALIZA CUSTOM FIELDS==================	
					
					response.end(jsonBodyResp);	 

			    });
			}); 
			// write the json data
			reqPost.write(jsonBody);
			reqPost.end();
			reqPost.on('error', function(e) {
			    console.error(e);
			});


		 });
	// }
}
// creates a server instance and binds the handler
var server = http.createServer(handleRequest);
	// starts server
	server.listen(PORT, function () {
	// callback triggered when server is sucessfully listening.
	console.log("Server listening on: http://localhost:%s", PORT);
})
