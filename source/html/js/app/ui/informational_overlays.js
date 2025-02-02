/*! Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
       SPDX-License-Identifier: Apache-2.0 */

       define(["jquery", "lodash", "app/model", "app/plugins", "app/ui/diagrams"],
       function($, _, model, plugins, diagrams) {
   
           var intervalID;
           // interval in millis to update the cache
           var update_interval = 5000;
   
           var update_overlay = function() {
               // console.log("info overlay update");
               // get all the overlays
               for (let module_name of plugins.overlays) {
                   const ov = require(module_name);
   
                   if (ov.informational == true) {
                       const nodes = model.nodes.get({
                           filter: function(item) {
                               return ov.match_type == (item.generic_node_type || item.title);
                           }
                       });
   
                       for (let node of nodes) {
                           let selected = node.render.normal_selected();
                           let unselected = node.render.normal_unselected();
   
                           if (node.degraded) {
                               selected = node.render.degraded_selected();
                               unselected = node.render.degraded_unselected();
                           } else if (node.alerting || node.alarming) {
                               selected = node.render.alert_selected();
                               unselected = node.render.alert_unselected();
                           }
   
                           // only update the node if the SVG changes
                           if (selected != node.image.selected || unselected != node.image.unselected) {
                               node.image.selected = selected;
                               node.image.unselected = unselected;
                               model.nodes.update(node);
   
                               const matches = diagrams.have_all([node.id]);
   
                               for (let diagram of matches) {
                                   diagram.nodes.update(node);
                               }
                           }
                       }
                   }
               }
           };
   
           var schedule_interval = function() {
               if (intervalID) {
                   clearInterval(intervalID);
               }
               intervalID = setInterval(update_overlay, update_interval);
               console.log("informational overlays: interval scheduled " + update_interval + "ms, intervalID = " + intervalID);
           };
   
           schedule_interval();
       });