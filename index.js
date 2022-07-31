
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

    transactionCalculate()
    .then((data)=>{
        res.render('index', {"data": data})
    })
    .catch((err)=>{
        res.send(err);
    })
})

app.listen(80)

con.connect(function(err) {

});


function transactionCalculate(){

    return new Promise((resolve, reject) => {

 
    con.query("SELECT * FROM orders INNER JOIN accept_deliveries ON orders.id = accept_deliveries.order_id WHERE DATE(orders.`created_at`) = CURDATE() AND orderstatus_id = 5", function (err, result, fields) {
        if (err) throw err;
        console.log("Total Number of Orders Delivered :" + result.length);
        console.log("Total order Value: " + result.reduce((s, f) => s + f.total, 0));
        let totalStoreOrderValue = result.reduce((s, f) => s + f.sub_total, 0);
        console.log("Sub Total Order Value: "+ totalStoreOrderValue);
        console.log("Total Delivery Charge: "+ result.reduce((s, f) => s + f.actual_delivery_charge, 0));

        let totalIncentives = 0;

        // Sunil Total Online Orders. 1551
        let sunilOrdersCount = _.where(result, {user_id: 1551}).length;
        console.log("Sunil Orders Count: "+ sunilOrdersCount);
        console.log("Sunil Incentive: "+  Math.floor(sunilOrdersCount/10) *50);
        totalIncentives =  totalIncentives + Math.floor(sunilOrdersCount/10) *50;


         // Subash Total Online Orders. 1697
        let subashOrdersCount = _.where(result, {user_id: 1697}).length;
        console.log("Subash Orders Count: "+ subashOrdersCount);
        console.log("Subash Incentive: "+  Math.floor(subashOrdersCount/10) *50);
        
        totalIncentives =  totalIncentives + Math.floor(subashOrdersCount/10) *50;

        // Shinde Total Online Orders. 1521
        let shindeOrdersCount = _.where(result, {user_id: 1521}).length;
        console.log("Shinde Orders Count: "+ shindeOrdersCount);


        // Parmar Total Online Orders. 1084
        let parmarShetOrdersCount = _.where(result, {user_id: 1084}).length;
        console.log("Parmar Shet Orders Count: "+ parmarShetOrdersCount);
        console.log("Parmar Shet Incentive: "+  Math.floor(parmarShetOrdersCount/10) *50);
        totalIncentives =  totalIncentives + Math.floor(parmarShetOrdersCount/10) *50;
        

        // sameer Total Online Orders. 1084
        let sameerOrdersCount = _.where(result, {user_id: 885}).length;
        console.log("Sameer Orders Count: "+ sameerOrdersCount);

        console.log("Total Incentives Distributed: "+ totalIncentives);

        console.log("Total Profit after deducting Incentive: "+ parseInt(totalStoreOrderValue) - parseInt(totalIncentives) );

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
                "incentive": Math.floor(sunilOrdersCount/10) *50
                },
                {
                    "name": "subhash",
                    "id":1697,
                    "orderCount": subashOrdersCount,
                    "incentive": Math.floor(subashOrdersCount/10) *50
                },
                {
                    "name": "Shinde",
                    "id":1521,
                    "orderCount": shindeOrdersCount,
                    "incentive": 0
                },
                {
                    "name": "Rahul Parmar",
                    "id":1084,
                    "orderCount": parmarShetOrdersCount,
                    "incentive": Math.floor(parmarShetOrdersCount/10) *50
                },

                {
                    "name": "Sameer Saase",
                    "id":885,
                    "orderCount": sameerOrdersCount,
                    "incentive": Math.floor(sameerOrdersCount/10) *50
                },
            ],
            "totalIncentives": totalIncentives,
            "totalOrderExpense": result.length *5
        })


  });
});
}



