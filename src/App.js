import React , {Component} from 'react';
import "./App.css";
import jsPDF from 'jspdf';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      commits: [],     
      showCommits: false,
      pullDataWithComments: [],
      showPullDataWithComments: false,
    }
  }
  
  getCommitsData = async () => {
    const repositoryName = 'Testing-Repo';
    const url = `https://api.github.com/repos/gannear/${repositoryName}/commits`;
    const headers = {
      "Authorization" : `Token b2bbd185f8107da356210c86da90caa75190ad43`
    }
    const response = await fetch(url, {
        "method": "GET",
        "headers": headers
    })
    const result = await response.json()
    this.setState(
      {
        commits: result,
        showCommits: true,
        showPullDataWithComments: false,
      }
    )
    let doc = new jsPDF('p','pt');
    doc.text(30,20,"Commits are :: ");
    let y = 40;
     for(var i=0; i<this.state.commits.length;i++){
      doc.text(30, y, this.state.commits[i].commit.message);
      y=y+20;
     } 
   doc.save("commits.pdf");
}

getPullsData = async () => {
  const repositoryName = 'Testing-Repo';
  const url = `https://api.github.com/repos/gannear/${repositoryName}/pulls`;
  const headers = {
    "Authorization" : `Token b2bbd185f8107da356210c86da90caa75190ad43`
  }
  const response = await fetch(url, {
      "method": "GET",
      headers: headers
  })
    
  const Data_list = await response.json()

  function make_api_call(id){
    const repositoryName = 'Testing-Repo';
    const url = `https://api.github.com/repos/gannear/${repositoryName}/pulls/${id}/comments`;
    const headers = {
      "Authorization" : `Token b2bbd185f8107da356210c86da90caa75190ad43`
    }
    return fetch( url, {
      "method": "GET",
      headers: headers
    }).then((response) => response.json()).then((data) => data);
}

async function processData(){
    let result;
    let promises = [];
    for(let i = 0; i < Data_list.length; i++){
        promises.push(make_api_call(Data_list[i].number));
    }
    result = await Promise.all(promises);

    for(let i = 0; i < Data_list.length; i++){
      Data_list[i]['result'] = result[i];
    }
    return Data_list;
}

 const generatePdf = async() => {
    const results = await processData();
    this.setState({
      pullDataWithComments: results,
      showPullDataWithComments: true,
      showCommits: false
    })
    console.log("1234",this.state.pullDataWithComments);
    var doc = new jsPDF('p','pt');
    let y = 20;
    let z = 30;
    this.state.pullDataWithComments.map((element) => {
      doc.text(30, y, element.body);
          element.result.map((ele) => {
            doc.text(60, y+30, ele.body);
            z=z+10;
            y=y+80;
          })
        })
   doc.save("pullsData.pdf");
}
generatePdf();  
}
  render(){
    const { showCommits,showPullDataWithComments,pullDataWithComments,commits } = this.state;
  return(
      <div className="App">
        <h2>Fetching Data of commits and Pulls request using github api</h2>
        <button className="btnStyle" onClick={this.getCommitsData}>Export Commits Data To PDF</button>
        <button className="btnStyle" onClick={this.getPullsData}>Export Pulls Data TO PDF</button>
         <div>
          {showCommits && commits.map((data, index) => (
            <dl key={index}>
              <dt className="listItem">
                {data.commit.message}
              </dt>
            </dl>
          ))}
          {showPullDataWithComments && pullDataWithComments.map((data, index) => (
            <dl key={index} className="listItem">
              <dt>
                {data.body}
              </dt>
              {data.result.map((element) => (
                <dd className="listItemInner" key={element.id}>{element.body}</dd>
              ))}
            </dl>
          ))}
        </div>
      </div>
     )
   }
 }
export default App;