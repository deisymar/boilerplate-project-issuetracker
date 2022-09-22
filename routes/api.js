'use strict';
var expect = require('chai').expect;
let mongodb = require('mongodb')
let mongoose = require('mongoose')

module.exports = function (app) {
 //Config 
  mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });
  
 //Schemas 
  let issueSchema = new mongoose.Schema({
      issue_title: {type: String, required: true},
      issue_text: {type: String, required: true},
      created_by : {type: String, required: true},
      assigned_to : String,
      status_text : String,
      open: {type: Boolean, required: true},
      created_on: {type: Date, required: true},
      updated_on: {type: Date, required: true},
      project: String
  })

  //model
  let Issue = mongoose.model('Issue', issueSchema)

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      //console.log(req.query);
      //Object.assign copies all enumerable own properties from one or more source objects 
      let queryIssue = Object.assign(req.query)
      queryIssue['project'] = project
      Issue.find(
        queryIssue,
        (error, dataIssue) => {
          if(error || !dataIssue){
            return res.send('Project not found')
          } else {
            return res.json(dataIssue)
          }
        }
      )
      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      
      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){        
        return res.json({error: 'required field(s) missing'})
      }
      
      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project
      })

      newIssue.save((error, savedIssue) => {
        //if (error) return res.status(500).send(error);
        if(error || !savedIssue) {
          res.send("There was an error saving this Issue");
        }
        else {
          console.log('Saved Issue is')
          //console.log(savedIssue)
          res.json(savedIssue)
    }
  })
      
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let updateObj = {}
      
      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      }
      //find and copy how many fields to update
      Object.keys(req.body).forEach((key) => {
        if(req.body[key] != ''){
          updateObj[key] = req.body[key]
        }
      })
      //if it's just id and not fields
      if(Object.keys(updateObj).length < 2){        
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id })
      }

      updateObj['updated_on'] = new Date().toUTCString()
      updateObj['open'] = req.body.open === 'false' ? false : true
      Issue.findByIdAndUpdate(
        req.body._id,
        updateObj,
        // an option that asks mongoose to return the updated version 
        {new: true},
        // the callback function
        (error, updatedIssue) => {
          if (error || !updatedIssue) {
              res.json({ error: "could not update", '_id': req.body._id });
            } else {
              res.json({ result: "successfully updated", '_id': req.body._id });
            }          
      }
    )
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      if(!req.body._id){        
        return res.json({ error: 'missing _id' })
      }
      Issue.findByIdAndRemove(req.body._id, (error, deletedIssue) => {         
        if(!error && deletedIssue){         
          res.json( { result: 'successfully deleted', '_id': deletedIssue.id })
        }else if(!deletedIssue){          
          res.json({ error: 'could not delete', '_id': req.body._id })
        }
      })
      
    });
    
};
