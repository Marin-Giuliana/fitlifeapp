export async function GET(){
    try {
    return new Response(JSON.stringify({result: "Hello world"}));
    } catch (error){
        if(error)
            return new Response(JSON.stringify({result: "Error"}));
    }
}
