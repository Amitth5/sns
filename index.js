
// const db = require("./dbConnection.js");

var mysql = require('mysql');
var _ = require('underscore');
var bodyParser = require('body-parser');

var con = mysql.createConnection({
    host: "184.168.125.140",
    user: "sweetand_spice_user",
    password: "x31748Amit$",
    database :"sweetand_spice_db",
  });


  const express = require('express')
  var app = express();

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    // parse application/json
    app.use(bodyParser.json())
  app.set('views', './views');
  // set the view engine to ejs
  app.set('view engine', 'ejs');

  app.get('/logs', function (req, res) {

    let currDate = new Date().toISOString().split('T')[0];

    if(req.query.date){
        currDate = req.query.date;
    }

    transactionCalculate(currDate, 0)
    .then((data)=>{
        res.render('index', {"data": data,"date": currDate})
    })
    .catch((err)=>{
        res.send(err);
    })
})




app.get('/stores', function (req, res) {
    let currDate = new Date().toISOString().split('T')[0];
    if(req.query.date){
        currDate = req.query.date;
    }
    console.log(currDate);
    getStoresDetails(currDate)
    .then((data)=>{
        res.render('stores', {"data" : data})
    })
    .catch((err)=>{
        res.send(err)
    });
});


app.get('/transaction', function (req, res) {
    let currDate = new Date().toISOString().split('T')[0];
    let dname = '000'
    let dId = '000';

    if(req.query.date){
        console.log(req.query);
        currDate = req.query.date;
    }

    if(req.query.dname){
        dname = req.query.dname;
    }

    if(req.query.dId){
        dId = req.query.dId;
    }


    let transactionData;
    getOrderDetails(currDate)
    .then(function(transData){
        transactionData = transData;
        return  transactionCalculate(currDate, transData);
    })
    .then((data)=>{
        res.render('transaction', {"data": data,"date": currDate, "transactionData": transactionData, "dname": dname, "dId": dId});
    })
    .catch((err)=>{
        res.send(err);
    })
});

app.get('/inserttransaction', function (req, res) {
    console.log(req.query);
    let pData = req.query.data;
    console.log(pData);
 
    con.query("INSERT INTO order_details (delivery_id, customer_name, restaurant_name, amount, status, transaction_date) VALUES ("+pData.delivery_boy+", '"+pData.customer_name+"', '"+pData.resto_name+"', '"+ pData.amount +"', "+pData.status+",'"+pData.transaction_date+"')", function (err, result, fields) {
        console.log(err);
        console.log(result);
        res.send(result);
    });

});

app.get('/deletetransaction', function (req, res) {
    console.log(req.query);
    let id = req.query.id;
    console.log(id);
    con.query("UPDATE order_details SET status = 7 WHERE id ="+id, function (err, result, fields) {
        console.log(err);
        console.log(result);
        res.send(result);
    });
});

app.listen(80)

con.connect(function(err) {
});



function getOrderDetails(currDate){
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM order_details  WHERE transaction_date = '"+ currDate +"'", function (err, result, fields) {
            if (err){ 
                reject (err)
            };
            resolve(result);
        });

    });
}


function transactionCalculate(currDate, orderData){
    return new Promise((resolve, reject) => {
    console.log(orderData);
    con.query("SELECT orders.total, orders.sub_total, orders.actual_delivery_charge, accept_deliveries.user_id FROM orders INNER JOIN accept_deliveries ON orders.id = accept_deliveries.order_id WHERE DATE(orders.`created_at`) = '"+ currDate +"' AND orderstatus_id = 5", function (err, result, fields) {

        if (err) throw err;

        console.log(result);
        let pendingAmount = 0;
        let amitAmount = 0;
        let refundAmount = 0;
        let offlineOrdersAmount = 0
        let hotelPayment = 0;
        let cancelOrdersAmount = 0;
        let pendingReceivedeOrdersAmount = 0;
        if(orderData != 0){
            let pendingOrders = _.where(orderData, {status: 1});
            pendingAmount = pendingOrders.reduce((s, f) => s + parseInt(f.amount), 0);

            let ordersPaymentAmit = _.where(orderData, {status: 5});
            amitAmount = ordersPaymentAmit.reduce((s, f) => s + parseInt(f.amount), 0);

            let refundOrders = _.where(orderData, {status: 4});
            refundAmount = refundOrders.reduce((s, f) => s + parseInt(f.amount), 0);

            let hotelOrdersPayment = _.where(orderData, {status: 3});
            hotelPayment = hotelOrdersPayment.reduce((s, f) => s + parseInt(f.amount), 0);

            let offlineOrdersPayment = _.where(orderData, {status: 2});
            offlineOrdersAmount = offlineOrdersPayment.reduce((s, f) => s + parseInt(f.amount), 0);


            let cancelledOrdersPayment = _.where(orderData, {status: 6});
            cancelOrdersAmount = cancelledOrdersPayment.reduce((s, f) => s + parseInt(f.amount), 0);


            let pendingReceivedOrdersPayment = _.where(orderData, {status: 7});
            pendingReceivedeOrdersAmount = pendingReceivedOrdersPayment.reduce((s, f) => s + parseInt(f.amount), 0);

        }
        let totalOrderValue = Math.round(result.reduce((s, f) => s + f.total, 0));
        let rahulReleasePayment = totalOrderValue - pendingAmount - amitAmount - refundAmount - hotelPayment - cancelOrdersAmount - pendingReceivedeOrdersAmount + offlineOrdersAmount;

        let totalStoreOrderValue = result.reduce((s, f) => s + f.sub_total, 0);
        let totalIncentives = 0;
        let totalDeductionFromDeliveryCharges = 0;

        // Sunil Total Online Orders. 1551
        let sunilOrders = _.where(result, {user_id: 1551});
        let sunilOrdersCount = sunilOrders.length
        totalIncentives = totalIncentives + getIncentive(sunilOrdersCount);

        //Rohit Dhanke
        let rohitOrders = _.where(result, {user_id: 2805});
        let rohitOrdersCount = rohitOrders.length
        totalIncentives = totalIncentives + getIncentive(rohitOrdersCount);


        //Satish
        let satishOrders = _.where(result, {user_id: 3183});
        let satishOrdersCount = satishOrders.length
        totalIncentives = totalIncentives + getIncentive(satishOrdersCount);


         // Subash Total Online Orders. 1697
        let subashOrders = _.where(result, {user_id: 1697});
        let subashOrdersCount = subashOrders.length;
        totalIncentives =  totalIncentives + getIncentive(subashOrdersCount);

        

        // Shinde Total Online Orders. 1521
        let vinayOrders = _.where(result, {user_id: 97});
        let vinayOrdersCount = vinayOrders.length;


        // Parmar Total Online Orders. 1084
        let parmarShetOrders = _.where(result, {user_id: 1084});
        let parmarShetOrdersCount = parmarShetOrders.length;
        totalIncentives = totalIncentives + getIncentive(parmarShetOrdersCount);

        

        // sameer Total Online Orders. 1084
        let sameerOrders = _.where(result, {user_id: 885});
        let sameerOrdersCount = sameerOrders.length;
        totalIncentives =  totalIncentives + getIncentive(sameerOrdersCount);

        // Krishna Total Online Orders. 1084
        let krishnaOrders = _.where(result, {user_id: 674});
        let krishnaOrdersCount = krishnaOrders.length;

        //Amit
        let amitOrders = _.where(result, {user_id: 96});
        let amitOrdersCount = amitOrders.length;


        let totalActualDeliveryCharge = result.reduce((s, f) => s + f.actual_delivery_charge, 0);


        resolve({
            "totalOrder": result.length,
            "totalOrderValue" : totalOrderValue,
            "totalStoreOrderValue": totalStoreOrderValue,
            "totalDeliveryCharge": totalActualDeliveryCharge,
            "rahulReleasePayment": rahulReleasePayment,
            "deliveryDetails": [
                {
                "name": "sunil",
                "id":1551,
                "orderCount": sunilOrdersCount,
                "incentive": getIncentive(sunilOrdersCount),
                "COD": sunilOrders.reduce((s, f) => s + f.total, 0),
                "Delivery Charges": sunilOrders.reduce(function(s, f) { 
                    if(f.actual_delivery_charge < 30){
                        totalDeductionFromDeliveryCharges =  totalDeductionFromDeliveryCharges + (30- f.actual_delivery_charge);
                        f.actual_delivery_charge = 30;
                    }
                    return s + f.actual_delivery_charge  
                }, 0)
                },
                {
                    "name": "subhash",
                    "id":1697,
                    "orderCount": subashOrdersCount,
                    "incentive": getIncentive(subashOrdersCount),
                    "COD": subashOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": subashOrders.reduce(function(s, f) { 
                        if(f.actual_delivery_charge < 30){
                            totalDeductionFromDeliveryCharges =  totalDeductionFromDeliveryCharges + (30- f.actual_delivery_charge);
                            f.actual_delivery_charge = 30;
                        }
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "vinay",
                    "id":97,
                    "orderCount": vinayOrdersCount,
                    "incentive": 0,
                    "COD": vinayOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": vinayOrders.reduce(function(s, f) { 
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "rahulparmar",
                    "id":1084,
                    "orderCount": parmarShetOrdersCount,
                    "incentive": getIncentive(parmarShetOrdersCount),
                    "COD": parmarShetOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": parmarShetOrders.reduce(function(s, f) { 
                        if(f.actual_delivery_charge < 30){
                            totalDeductionFromDeliveryCharges =  totalDeductionFromDeliveryCharges + (30- f.actual_delivery_charge);
                            f.actual_delivery_charge = 30;
                        }
                        return s + f.actual_delivery_charge  
                    }, 0),
                },

                {
                    "name": "sameer",
                    "id":885,
                    "orderCount": sameerOrdersCount,
                    "incentive": getIncentive(sameerOrdersCount),
                    "COD": sameerOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": sameerOrders.reduce(function(s, f) { 
                        if(f.actual_delivery_charge < 30){
                            totalDeductionFromDeliveryCharges =  totalDeductionFromDeliveryCharges + (30- f.actual_delivery_charge);
                            f.actual_delivery_charge = 30;
                        }
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "krishna",
                    "id":674,
                    "orderCount": krishnaOrdersCount,
                    "incentive": 0,
                    "COD": krishnaOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": krishnaOrders.reduce(function(s, f) { 
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "amit",
                    "id":96,
                    "orderCount": amitOrdersCount,
                    "incentive": getIncentive(amitOrdersCount),
                    "COD": amitOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": amitOrders.reduce(function(s, f) { 
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "bhagwan",
                    "id":2805,
                    "orderCount": rohitOrdersCount,
                    "incentive": getIncentive(rohitOrdersCount),
                    "COD": rohitOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": rohitOrders.reduce(function(s, f) { 
                        if(f.actual_delivery_charge < 30){
                            totalDeductionFromDeliveryCharges =  totalDeductionFromDeliveryCharges + (30- f.actual_delivery_charge);
                            f.actual_delivery_charge = 30;
                        }
                        return s + f.actual_delivery_charge;  
                    }, 0)
                },
                {
                    "name": "satish",
                    "id":3183,
                    "orderCount": satishOrdersCount,
                    "incentive": getIncentive(satishOrdersCount),
                    "COD": satishOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": satishOrders.reduce(function(s, f) { 
                        if(f.actual_delivery_charge < 30){
                            totalDeductionFromDeliveryCharges =  totalDeductionFromDeliveryCharges + (30- f.actual_delivery_charge);
                            f.actual_delivery_charge = 30;
                        }
                        return s + f.actual_delivery_charge;  
                    }, 0)
                }
            ],
            "totalIncentives": totalIncentives,
            "totalOrderExpense": totalDeductionFromDeliveryCharges + totalIncentives,
            "deliveryDeduction" : totalDeductionFromDeliveryCharges + totalIncentives + totalActualDeliveryCharge
        })
  });
  
});
}


function getStoresDetails(currDate){
    return new Promise((resolve, reject) => {
        console.log("SELECT * FROM orders WHERE DATE(`created_at`) = "+ currDate +"  AND orderstatus_id = 5");
            con.query("SELECT * FROM orders WHERE DATE(`created_at`) = '"+ currDate +"'  AND orderstatus_id = 5", function (err, result, fields) {
                
                let nisargOrders = _.where(result, {restaurant_id: 15});
                let nisargOrderDetils = nisargOrders.reduce(function(s, f){ 
                    let pricePreGst = f.sub_total - (10/100)*f.sub_total;
                    let priceAfterComission = pricePreGst - (10/100)*pricePreGst;
                    let actualPriceToPay = priceAfterComission + (5/100)*f.sub_total;
                    return s + actualPriceToPay;               
                }, 0);
                
                let nisargSnacksOrders = _.where(result, {restaurant_id: 67});
                let nisargSnacksOrderDetils = nisargSnacksOrders.reduce(function(s, f){ 
                    let _pricePreGst = f.sub_total - (10/100)*f.sub_total;
                    let _priceAfterComission = _pricePreGst - (10/100)*_pricePreGst;
                    let _actualPriceToPay = _priceAfterComission + (5/100)*f.sub_total;
                    return s + _actualPriceToPay;               
                }, 0);

                resolve([
                    {"sale":nisargOrderDetils + nisargSnacksOrderDetils,
                    "orderCount": nisargOrders.length,
                    "profit": nisargOrders.reduce((s, f) => s + f.sub_total, 0) - nisargOrderDetils
                    }]);
            });
    });
}


function getIncentive(orderCount){
    if(orderCount>=20 && orderCount <=30){
    return 50;
    }else if(orderCount>=30 && orderCount <40){
        return 100;
    }
    else if(orderCount>=40 && orderCount <50){
        return 200;
    }
    else if(orderCount>=50 && orderCount <60){
        return 300;
    }
    else if(orderCount>=60 && orderCount <70){
        return 400;
    }
    else if(orderCount>=70 && orderCount <80){
        return 500;
    }
    else{
       return 0; 
    }
}
