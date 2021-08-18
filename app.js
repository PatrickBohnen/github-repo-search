//Global consts
const userProfile = document.getElementById('userProfile');
const searchResults = document.getElementById('searchResults');


// Add event listener to form
document.getElementById('usernameForm').addEventListener('submit', (e) => {

    e.preventDefault();
    let usernameInputValue = document.getElementById('usernameInput').value;
    let repoQuantityValue = document.getElementById('repoQuantityInput').value;
    let commitQuantityValue = document.getElementById('commitQuantityInput').value;

    let repoQuantity = (repoQuantityValue ? repoQuantityValue : 5);
    let commitQuantity = (commitQuantityValue ? commitQuantityValue : 10);

    //Reset existing results (if any)
    userProfile.innerHTML = '';
    searchResults.innerHTML = '';
    
    //Get and show results
    userProfile.classList.remove('hidden');
    requestUserRepos(usernameInputValue, repoQuantity, commitQuantity);

})


//Build search results
function requestUserRepos(username, repoQuantity, commitQuantity){
    
    // Define repo url and open request
    const xhr = new XMLHttpRequest();
    const reposURL = `https://api.github.com/users/${username}/repos?sort=updated&per_page=${repoQuantity}`;
    xhr.open('GET', reposURL, true);
    
    // Process request
    xhr.onload = function () {
    
        // Parse API data
        const reposData = JSON.parse(this.response);

        // Check for valid username and build profile block
        if (reposData.length > 0) {    
            let userInfo = reposData[0].owner;
            userProfile.innerHTML = (`
                <img src="${userInfo.avatar_url}" alt="" />
                <p class="username">${userInfo.login}</p>
                <a class="profileURL" href="${userInfo.html_url}" target="_blank">${userInfo.html_url}</a>
            `);
        } else {
            userProfile.innerHTML = '<p class="errorMessage">Error: Something has gone wrong, try again.</p>'
        }

        // Build list items for each Repo
        for (let i = 0; i < reposData.length; i++) {

            let repo = document.createElement('li');
            repo.classList.add('repoListItem');
            
            // Create HTML for each result
            repo.innerHTML = (`
                <p class="repoName">${reposData[i].name}</p>
                <hr>
                <p>${reposData[i].description}</p>
                <p><a href="${reposData[i].html_url}">${reposData[i].html_url}</a></p>
                <details>
                    <summary>See the ${commitQuantity} most recent commits.</summary>
                    <ul id="${reposData[i].name}Commits"></ul>
                </details>
            `);

            // Add commits to repo
            requestRepoCommits(username, reposData[i].name, commitQuantity);
            
            // Append each li to the ul
            searchResults.appendChild(repo);
        }

    }

    //Send Request
    xhr.send();
    
}


//List most recent commits (default 10)
function requestRepoCommits(username, repoName, commitQuantity){

    // define commits url and open request
    const xhr = new XMLHttpRequest();
    let commitsURL = `https://api.github.com/repos/${username}/${repoName}/commits?per_page=${commitQuantity}`; 
    xhr.open('GET', commitsURL, true);
    
    // Process request

    xhr.onload = function () {  
        // Parse API data into JSON
        let commitsData = JSON.parse(this.response);

        //Build commits dropdown
        for (let i = 0; i < commitsData.length; i++) {
            let commit = document.createElement('li');
            let commitDate = new Date(commitsData[i].commit.author.date);

            commit.innerHTML = (`
                <hr>
                <p><span>Author:</span> ${commitsData[i].commit.author.name}</p>
                <p><span>Date:</span> ${commitDate}</p>
                <p><span>Message:</span> ${commitsData[i].commit.message}</p>
                <p><span>Commit URL:</span> <a href="${commitsData[i].html_url}">${commitsData[i].html_url}</a></p>
            `);
            document.getElementById(repoName + "Commits").appendChild(commit); 
        }
    }

    //Send request
    xhr.send();
    
}