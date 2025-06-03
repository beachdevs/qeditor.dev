globalThis.Guid ??= class Guid {
    async generateIdentityKeys() {
        const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
        
        const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
        const pub = await crypto.subtle.exportKey("raw", kp.publicKey);
        const priv = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
        const hash = await crypto.subtle.digest("SHA-256", pub);
        
        // Convert the hash (Uint8Array) to a number and then to base32 using toString(32)
        const base32Hash = Array.from(new Uint8Array(hash)).map(byte => byte.toString(32)).join('');
        
        // Slice to get an 8-character ID
        const id = base32Hash.slice(0, 8);
    
        return {
        publicKey: toHex(pub),
        privateKey: toHex(priv),
        id
        };
    }
 
    static async create() {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        function toBase62(num) {
            let result = '';
            while (num > 0) {
                result = chars[num % 62] + result;
                num = Math.floor(num / 62);
            }
            return result || '0'; // in case the number is 0
        }
    
        let time = Date.now();
        if (time === globalThis.lastGUID) {
            await new Promise(r => setTimeout(r, 1));
            time = Date.now();
        }
        globalThis.lastGUID = time;
        return toBase62(time);
    }
    
    static decode(guid) {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let num = 0;
        for (let i = 0; i < guid.length; i++) {
            num = num * 62 + chars.indexOf(guid[i]);
        }
        return new Date(num);
    }
}

export default globalThis.Guid;
