import { Html, Head, Main, NextScript } from "next/document";

const Document = () => {
    return (
        <Html>
            <Head>
                {/* Global site tag (gtag.js) - Google Analytic */}
                <script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=G-2VSQZMZCY6"
                ></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.dataLayer = window.dataLayer || []; function gtag()
                   {dataLayer.push(arguments)}
                   gtag('js', new Date()); gtag('config', 'G-2VSQZMZCY6');`,
                    }}
                ></script>

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

                <meta charSet="utf-8" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
                <meta name="msapplication-TileColor" content="	#00800" />
                <meta name="theme-color" content="	#00800" />

                <meta name="title" content="Prings - LinkedIn frame generator" />
                <meta name="description" content="Add LinkedIn frames to your profile picture, customize the text, colors, and more" />

                {/*<!-- Open Graph / Facebook -->*/}
                <meta property="og:title" content="Prings - LinkedIn frame generator" />
                <meta
                    property="og:description"
                    content="Add LinkedIn frames to your profile picture, customize the text, colors, and more"
                />
                <meta property="og:url" content="https://prings.vercel.app" />
                <meta property="og:type" content="website" />
                <meta
                    property="og:image"
                    content="https://ik.imagekit.io/lapstjup/prings/prings_og_image.png"
                />

                {/* <!-- Twitter -->*/}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://prings.vercel.app" />
                <meta property="twitter:title" content="Prings - LinkedIn frame generator" />
                <meta
                    property="twitter:description"
                    content="Add LinkedIn frames to your profile picture, customize the text, colors, and more"
                />
                <meta
                    property="twitter:image"
                    content="https://ik.imagekit.io/lapstjup/prings/prings_og_image.png"
                />
                <meta name="twitter:site" content="@lakbychance" />
                <meta name="twitter:creator" content="@lakbychance" />

                {/* Others */}
                <meta name="keywords" content="Linkedin, Profile Ring, Prings, Frames, Profile Picture, Profile Picture Frames, LinkedIn Frames, LinkedIn Profile Picture Frames, Linkedin image hashtag creator" />
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
