const MAX_LEN=5;

export function generate()
{
    let ans="";
    const subset="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for(let i=0;i<MAX_LEN;i++)
    {
        const index=Math.floor(Math.random()*subset.length);
        ans+=subset[index];
    }
    return ans;
}
