import {useState} from "react";

const Sources = ({documents}) => {

    return (
        <div style={{
            backgroundColor: "#f0f0f0",
            padding: "20px",
            width: "300px",
            overflowY: "auto",
        }}>
            <h1 className="text-xl" style={{marginBottom: "20px"}}>Sources</h1>
            {documents.length > 0 ? documents.map((document, index) => (
                <div key={index} style={{marginBottom: "30px"}}>
                    <strong style={{marginBottom: "10px"}}>{document["name"]}</strong>
                    <p style={{fontSize: "12px"}}>{document["content"]}</p>
                </div>
            )) :
                <strong>No content from uploaded files was retrieved for this response.</strong>}
        </div>
    )
}

export default Sources;
