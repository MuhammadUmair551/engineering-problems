const readline = require("readline");

const documents = [
    {
        id: 1,
        title: "JavaScript Basics",
        text: "JavaScript is a programming language. JavaScript is popular."
    },
    {
        id: 2,
        title: "Python Basics",
        text: "Python is a programming language. Python is easy."
    },
    {
        id: 3,
        title: "JavaScript and Python",
        text: "JavaScript and Python are both popular programming languages."
    },
    {
        id: 4,
        title: "React Guide",
        text: "React is a JavaScript library used for building user interfaces."
    },
    {
        id: 5,
        title: "Web Development",
        text: "JavaScript, React and HTML are important for web development."
    }
];

const invertedIndex = new Map();

const wordFrequency = new Map();

function buildIndex(documents) {

    for (const document of documents) {

        const words = document.text
            .toLowerCase()
            .match(/\b\w+\b/g) || [];


        for (const word of words) {

            if (!invertedIndex.has(word)) {
                invertedIndex.set(word, new Set());
            }

            invertedIndex.get(word).add(document.id);


            if (!wordFrequency.has(word)) {
                wordFrequency.set(word, new Map());
            }

            const frequencyMap = wordFrequency.get(word);

            frequencyMap.set(
                document.id,
                (frequencyMap.get(document.id) || 0) + 1
            );
        }
    }
}


function intersection(setA, setB) {

    const result = new Set();

    for (const value of setA) {

        if (setB.has(value)) {
            result.add(value);
        }
    }

    return result;
}

function union(setA, setB) {

    const result = new Set(setA);

    for (const value of setB) {
        result.add(value);
    }

    return result;
}


function search(query) {

    query = query.toLowerCase().trim();

    if (query.includes(" and ")) {

        const words = query
            .split(" and ")
            .map(word => word.trim());


        let result = null;


        for (const word of words) {

            const documentsForWord =
                invertedIndex.get(word) || new Set();


            if (result === null) {
                result = new Set(documentsForWord);
            } else {
                result = intersection(
                    result,
                    documentsForWord
                );
            }
        }

        return rankResults(result);
    }

    if (query.includes(" or ")) {

        const words = query
            .split(" or ")
            .map(word => word.trim());


        let result = new Set();


        for (const word of words) {

            const documentsForWord =
                invertedIndex.get(word) || new Set();

            result = union(
                result,
                documentsForWord
            );
        }

        return rankResults(result);
    }

    const documentsForWord =
        invertedIndex.get(query) || new Set();


    return rankResults(documentsForWord);
}

function rankResults(documentIds) {

    const results = [];


    for (const documentId of documentIds) {

        let score = 0;

        for (const [word, frequencyMap] of wordFrequency) {

            if (frequencyMap.has(documentId)) {

                score += frequencyMap.get(documentId);
            }
        }


        results.push({
            documentId,
            score
        });
    }

    results.sort((a, b) => b.score - a.score);


    return results;
}

function displayResults(results) {

    if (results.length === 0) {

        console.log("\nNo results found.");
        return;
    }


    console.log("\nSearch Results:");


    for (const result of results) {

        const document = documents.find(
            doc => doc.id === result.documentId
        );


        console.log(
            `${document.id}. ${document.title} | Score: ${result.score}`
        );
    }
}

buildIndex(documents);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function askQuestion() {

    rl.question(
        "\nEnter search query (or type exit): ",
        (query) => {

            if (query.toLowerCase() === "exit") {

                rl.close();
                return;
            }


            const results = search(query);

            displayResults(results);


            askQuestion();
        }
    );
}


console.log("Efficient Search Index");

console.log("\nExamples:");
console.log("javascript");
console.log("javascript AND python");
console.log("javascript OR python");

askQuestion();