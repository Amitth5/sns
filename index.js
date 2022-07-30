
// const db = require("./dbConnection.js");

var mysql = require('mysql');
var _ = require('underscore');

var con = mysql.createConnection({
    host: "184.168.125.140",
    user: "sweetand_spice_user",
    password: "x31748Amit$",
    database :"sweetand_spice_db",
  });
  
  con.connect(function(err) {
    if (err) throw err;
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


          


      });
  });



