
//“I want to use Clerk as the auth provider, and here's the domain and JWT template to trust when validating users.”
export default {
    providers: [
     {
        domain:"https://fair-dolphin-51.clerk.accounts.dev/",
        applicationID:"convex",
     },
    ]
}