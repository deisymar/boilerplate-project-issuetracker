const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const expect = chai.expect;

let id1 = "31206803aeb793f5a895v35b";
let id2 = "33206803aeb793f5a895v35c";

suite('Functional Tests', function() {
  suite("POST /api/issues/{project} => object with issue data", function() {
    test("Every field filled in", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Functional Test - Every field filled in",
          issue_text: "Some text",
          created_by: "DM - FFC",
          assigned_to: "Chai and Mocha",
          status_text: "In QA"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Functional Test - Every field filled in");
          assert.equal(res.body.issue_text, "Some text");
          assert.equal(
            res.body.created_by,
            "DM - FFC"
          );
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.status_text, "In QA");
          assert.equal(res.body.project, "test");
          id1 = res.body._id;
          console.log("id 1 has been set as " + id1);
          done();
        });
  })

    test("Required fields filled in", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Functional Test - Required fields filled in",
          issue_text: "Few text",
          created_by: "DM - FFC"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Functional Test - Required fields filled in");
          assert.equal(res.body.issue_text, "Few text");
          assert.equal(res.body.created_by, "DM - FFC");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.equal(res.body.project, "test");
          id2 = res.body._id;
          console.log("id 2 has been set as " + id2);
          done();
        })
    });

    test("Missing required fields", function(done) {
        chai
          .request(server)
          .post("/api/issues/test")
          .send({
            issue_title: "Functional Test - Missing required fields"
          })
          .end(function(err, res) {            
            assert.equal(res.body.error, 'required field(s) missing');
            done();
          });
      });    
    
  }); 

  suite("GET /api/issues/{project} => Array of objects with issue data",
      function() {
    test("No filter", function(done) {
          chai
            .request(server)
            .get("/api/issues/test")
            .query({})
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.isArray(res.body);
              assert.property(res.body[0], "issue_title");
              assert.property(res.body[0], "issue_text");
              assert.property(res.body[0], "created_on");
              assert.property(res.body[0], "updated_on");
              assert.property(res.body[0], "created_by");
              assert.property(res.body[0], "assigned_to");
              assert.property(res.body[0], "open");
              assert.property(res.body[0], "status_text");
              assert.property(res.body[0], "_id");
              done();
            });    
  });

    test("One filter", function(done) {
          chai
            .request(server)
            .get("/api/issues/test")
            .query({ created_by: "Functional Test - Every field filled in" })
            .end(function(err, res) {
              res.body.forEach(issueResult => {
                assert.equal(
                  issueResult.created_by,
                  "Functional Test - Every field filled in"
                );
              });
              done();
            });
        });

    test("Multiple filters (test for multiple fields you know will be in the db for a return)", function(done) {
          chai
            .request(server)
            .get("/api/issues/test")
            .query({
              open: true,
              created_by: "Functional Test - Every field filled in"
            })
            .end(function(err, res) {
              res.body.forEach(issueResult => {
                assert.equal(issueResult.open, true);
                assert.equal(
                  issueResult.created_by,
                  "Functional Test - Every field filled in"
                );
              });
              done();
            });
        });
        
  });

  suite("PUT /api/issues/{project} => text", function() {
    test("No body", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({})
        .end(function(err, res) {
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    test("No id", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({         
          issue_text: "Update text"
        })
        .end(function(err, res) {
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    test("No fields", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({ _id: id1})
        .end(function(err, res) {
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, id1);
          done();
        });
    });

    test("One field to update", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: id1,
          issue_text: "Update text"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, id1);
          done();
        });
    });

    test("Multiple fields to update (valid)", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: id2,
          issue_title: "Update title",
          issue_text: "Update text"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, id2);
          done();
        });
    });

    test("Multiple fields to update with error", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: "noexist",
          issue_title: "Update title",
          issue_text: "Update text"
        })
        .end(function(err, res) {
          assert.equal(res.status,200);
          assert.equal(res.body.error,"could not update");
          assert.equal(res.body._id,"noexist");
          done();
        });
    });
    
  });

  suite("DELETE /api/issues/{project} => text", function() {
     test("No _id", function(done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({})
          .end(function(err, res) {
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });

      test("Valid _id", function(done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({ _id: id1})
          .end(function(err, res) {
            assert.equal(res.body.result, "successfully deleted");
            assert.equal(res.body._id, id1);
          });
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({ _id: id2})
          .end(function(err, res) {
             assert.equal(res.body.result, "successfully deleted");
            assert.equal(res.body._id, id2);
            done();
          });
      });
  });
  
});
