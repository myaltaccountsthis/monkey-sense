import Game from "@/components/game";

export default function Home() {
    return (
        <div>
            <head>
                <title>Monkey Sense</title>
                <meta charSet="utf-8" />
                <link rel="stylesheet" href="styles.css" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"></script>
                <script src="generator.js"></script>
                <script src="main.js"></script>
                <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
            </head>
            <h1>Monkey Sense</h1>
            <Game />
        </div>
    );
}
