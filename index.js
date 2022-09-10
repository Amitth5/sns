
// const db = require("./dbConnection.js");

var mysql = require('mysql');
var _ = require('underscore');

var con = mysql.createConnection({
    host: "184.168.125.140",
    user: "sweetand_spice_user",
    password: "x31748Amit$",
    database :"sweetand_spice_db",
  });


  const express = require('express')
  var app = express();
  app.set('views', './views');
  // set the view engine to ejs
  app.set('view engine', 'ejs');

app.get('/', function (req, res) {

    let currDate = new Date().toISOString().split('T')[0];

    if(req.query.date){
        console.log('Req query found');
        console.log(req.query);
        currDate = req.query.date;
    }

    console.log(currDate);
    transactionCalculate(currDate)
    .then((data)=>{
        res.render('index', {"data": data,"date": currDate})
    })
    .catch((err)=>{
        res.send(err);
    })
})

app.get('/stores', function (req, res) {

    getStoresDetails()
    .then((data)=>{
        res.render('stores', {"data" : data})
    })
    .catch((err)=>{
        res.send(err)
    });
});


app.get('/stores', function (req, res) {

    getStoresDetails()
    .then((data)=>{
        res.render('stores', {"data" : data})
    })
    .catch((err)=>{
        res.send(err)
    });
});


app.get('/transaction', function (req, res) {

    res.render('transaction');
});

app.listen(80)

con.connect(function(err) {
});


function transactionCalculate(currDate){
    return new Promise((resolve, reject) => {

        console.log("SELECT * FROM orders INNER JOIN accept_deliveries ON orders.id = accept_deliveries.order_id WHERE DATE(orders.`created_at`) = '"+ currDate +"' AND orderstatus_id = 5");
    con.query("SELECT * FROM orders INNER JOIN accept_deliveries ON orders.id = accept_deliveries.order_id WHERE DATE(orders.`created_at`) = '"+ currDate +"' AND orderstatus_id = 5", function (err, result, fields) {

        if (err) throw err;

        let totalStoreOrderValue = result.reduce((s, f) => s + f.sub_total, 0);
        let totalIncentives = 0;
        let totalDeductionFromDeliveryCharges = 0;

        // Sunil Total Online Orders. 1551
        let sunilOrders = _.where(result, {user_id: 1551});
        let sunilOrdersCount = sunilOrders.length
        totalIncentives = totalIncentives + getIncentive(sunilOrdersCount);

        //Rohit Dhanke
        let rohitOrders = _.where(result, {user_id: 2733});
        let rohitOrdersCount = rohitOrders.length
        totalIncentives = totalIncentives + getIncentive(rohitOrdersCount);


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

        //Shree
        let amitOrders = _.where(result, {user_id: 96});
        let amitOrdersCount = amitOrders.length;

        resolve({
            "totalOrder": result.length,
            "totalOrderValue" : result.reduce((s, f) => s + f.total, 0),
            "totalStoreOrderValue": totalStoreOrderValue,
            "totalDeliveryCharge": result.reduce((s, f) => s + f.actual_delivery_charge, 0),
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
                    "name": "Vinay",
                    "id":97,
                    "orderCount": vinayOrdersCount,
                    "incentive": 0,
                    "COD": vinayOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": vinayOrders.reduce(function(s, f) { 
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "Rahul Parmar",
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
                    "name": "Sameer Saase",
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
                    "name": "Krishna",
                    "id":674,
                    "orderCount": krishnaOrdersCount,
                    "incentive": 0,
                    "COD": krishnaOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": krishnaOrders.reduce(function(s, f) { 
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "Amit",
                    "id":96,
                    "orderCount": amitOrdersCount,
                    "incentive": getIncentive(amitOrdersCount),
                    "COD": amitOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": amitOrders.reduce(function(s, f) { 
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "Rohit Dhanke",
                    "id":2733,
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
                    }
            ],
            "totalIncentives": totalIncentives,
            "totalOrderExpense": totalDeductionFromDeliveryCharges + totalIncentives
        })
  });
  
});
}


function getStoresDetails(){
    return new Promise((resolve, reject) => {
        console.log("Inside getStoreDetails Function");
            con.query("SELECT * FROM orders WHERE DATE(`created_at`) = CURDATE()-1  AND orderstatus_id = 5", function (err, result, fields) {
                
                let nisargOrders = _.where(result, {restaurant_id: 15});
                let nisargOrderDetils = nisargOrders.reduce(function(s, f){ 
                    let pricePreGst = f.sub_total - (10/100)*f.sub_total;
                    let priceAfterComission = pricePreGst - (10/100)*pricePreGst;
                    let actualPriceToPay = priceAfterComission + (5/100)*f.sub_total;
                    return s + actualPriceToPay;               
                }, 0);

                resolve([
                    {"sale":nisargOrderDetils,
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
