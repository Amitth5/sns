
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
})

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
        console.log("Sunil Orders Count: "+ sunilOrdersCount);
        console.log("Sunil Incentive: "+  Math.floor(sunilOrdersCount/10) *50);
        totalIncentives =  totalIncentives + Math.floor(sunilOrdersCount/20) *50;


         // Subash Total Online Orders. 1697
        let subashOrders = _.where(result, {user_id: 1697});
        let subashOrdersCount = subashOrders.length;
        console.log("Subash Orders Count: "+ subashOrdersCount);
        console.log("Subash Incentive: "+  Math.floor(subashOrdersCount/20) *50);
        
        totalIncentives =  totalIncentives + Math.floor(subashOrdersCount/20) *50;

        // Shinde Total Online Orders. 1521
        let shindeOrders = _.where(result, {user_id: 1521});
        let shindeOrdersCount = shindeOrders.length;
        console.log("Shinde Orders Count: "+ shindeOrdersCount);


        // Parmar Total Online Orders. 1084
        let parmarShetOrders = _.where(result, {user_id: 1084});
        let parmarShetOrdersCount = parmarShetOrders.length;
        console.log("Parmar Shet Orders Count: "+ parmarShetOrdersCount);
        console.log("Parmar Shet Incentive: "+  Math.floor(parmarShetOrdersCount/10) *50);
        

        // sameer Total Online Orders. 1084
        let sameerOrders = _.where(result, {user_id: 885});
        let sameerOrdersCount = sameerOrders.length;
        console.log("Sameer Orders Count: "+ sameerOrdersCount);
        console.log("Total Incentives Distributed: "+ totalIncentives);
        console.log("Total Profit after deducting Incentive: "+ parseInt(totalStoreOrderValue) - parseInt(totalIncentives) );
      

        
        // Krishna Total Online Orders. 1084
        let krishnaOrders = _.where(result, {user_id: 885});
        let krishnaOrdersCount = sameerOrders.length;


        //Shree
        let shreeOrders = _.where(result, {user_id: 2381});
        let shreeOrdersCount = shreeOrders.length;
        totalIncentives =  totalIncentives + Math.floor(shreeOrdersCount/20) *50;





        console.log("Krishna Orders Count: "+ krishnaOrdersCount);
        console.log("Total Incentives Distributed: "+ totalIncentives);
        console.log("Total Profit after deducting Incentive: "+ parseInt(totalStoreOrderValue) - parseInt(totalIncentives) );

        let krishnaDeliveryCharges =  krishnaOrders.reduce(function(s, f) { 
            if(f.actual_delivery_charge < 30){
                f.actual_delivery_charge = 30;
            }
            return s + f.actual_delivery_charge  
        }, 0)

        let sunilDeliveryCharges =  sunilOrders.reduce(function(s, f) { 
            if(f.actual_delivery_charge < 30){
                f.actual_delivery_charge = 30;
            }
            return s + f.actual_delivery_charge  
        }, 0)

        console.log(sunilDeliveryCharges);

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
                "incentive": Math.floor(sunilOrdersCount/20) *50,
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
                    "name": "Shinde",
                    "id":1521,
                    "orderCount": shindeOrdersCount,
                    "incentive": 0,
                    "COD": shindeOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": shindeOrders.reduce(function(s, f) { 
                        if(f.actual_delivery_charge < 30){
                            totalDeductionFromDeliveryCharges =  totalDeductionFromDeliveryCharges + (30- f.actual_delivery_charge);
                            f.actual_delivery_charge = 30;
                        }
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "Rahul Parmar",
                    "id":1084,
                    "orderCount": parmarShetOrdersCount,
                    "incentive": Math.floor(parmarShetOrdersCount/20) *50,
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
                    "incentive": 0,
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
                        if(f.actual_delivery_charge < 30){
                            totalDeductionFromDeliveryCharges =  totalDeductionFromDeliveryCharges + (30- f.actual_delivery_charge);
                            f.actual_delivery_charge = 30;
                        }
                        return s + f.actual_delivery_charge  
                    }, 0),
                },
                {
                    "name": "Shree",
                    "id":2381,
                    "orderCount": shreeOrdersCount,
                    "incentive": 0,
                    "COD": shreeOrders.reduce((s, f) => s + f.total, 0),
                    "Delivery Charges": shreeOrders.reduce(function(s, f) { 
                        if(f.actual_delivery_charge < 30){
                            totalDeductionFromDeliveryCharges =  totalDeductionFromDeliveryCharges + (30- f.actual_delivery_charge);
                            f.actual_delivery_charge = 30;
                        }
                        return s + f.actual_delivery_charge  
                    }, 0),
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
    if(orderCount<30){
    return Math.floor(orderCount/20) *50
    }else{
       return 100; 
    }
}
