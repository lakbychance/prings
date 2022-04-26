import { Html, Head, Main, NextScript } from "next/document";

const Document = () => {
    return (
        <Html>
            <Head>
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
                <link rel="manifest" href="/manifest.json" />

                <title>Prings</title>

                <meta charSet="utf-8" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
                <meta name="msapplication-TileColor" content="	#00800" />
                <meta name="theme-color" content="	#00800" />

                <meta name="title" content="Prings" />
                <meta name="description" content="Add LinkedIn style profile rings to your images" />

                <meta property="og:title" content="Prings" />
                <meta
                    property="og:description"
                    content="Add LinkedIn style profile rings to your images"
                />
                <meta property="og:url" content="https://www.prings.vercel.app" />
                <meta property="og:type" content="website" />
                <meta
                    property="og:image"
                    content="https://ik.imagekit.io/lapstjup/prings/prings_og_image.png"
                />

                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://www.prings.vercel.app" />
                <meta property="twitter:title" content="Prings" />
                <meta
                    property="twitter:description"
                    content="Add LinkedIn style profile rings to your images"
                />
                <meta
                    property="twitter:image"
                    content="https://ik.imagekit.io/lapstjup/prings/prings_og_image.png"
                />
                <meta name="twitter:site" content="@lakbychance" />
                <meta name="twitter:creator" content="@lakbychance" />

                {/* Others */}
                <meta name="keywords" content="Linkedin, Profile Ring, Prings" />
                <meta name="author" content="Lakshya Thakur" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
};
export default Document;
