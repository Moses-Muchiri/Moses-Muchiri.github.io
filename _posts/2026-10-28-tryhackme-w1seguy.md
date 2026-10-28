---
layout: post
title: "TryHackMe W1seGuy: breaking a five-character XOR key"
---

[W1seGuy](https://tryhackme.com/room/w1seguy) is a short crypto room on TryHackMe. A service sends you a hex string and asks for the key that produced it. Get the key right and you get the second flag. My solution is in [thm-W1seGuy](https://github.com/Moses-Muchiri/thm-W1seGuy).

## The server

The room gives you the server's source, so there is no guessing about how the hex is made. Each connection gets a new five-character key drawn from letters and digits, the first flag is XORed with it, and the result goes out as hex:

```python
key = "".join(random.choices(string.ascii_letters + string.digits, k=5))
xored = "".join(chr(ord(c) ^ ord(key[i % 5])) for i, c in enumerate(flag))
send(xored.encode().hex())
```

A new key for every connection is a good habit, undermined somewhat by the key being five characters long.

## The weakness

XOR is its own inverse: if `c = p ^ k`, then `k = c ^ p`. Every byte of plaintext you know gives you a byte of the key.

The flag format hands over five of them, since flags start with `THM{` and end with `}`.

- XOR the first four bytes of ciphertext with `THM{` and you have the first four key characters.
- XOR the last byte with `}` and you have the fifth, as long as the flag's length is a multiple of five so that byte lines up with the last key character. Here it does. If it didn't, there would only be 62 characters to try.

## Solver

```python
import sys

def derive_key_part(data, known, start):
    return "".join(chr(data[start + i] ^ ord(c)) for i, c in enumerate(known))

def xor_decrypt(data, key):
    return "".join(chr(b ^ ord(key[i % len(key)])) for i, b in enumerate(data))

data = bytes.fromhex(sys.argv[1])
start = derive_key_part(data, "THM{", 0)            # known prefix
end = derive_key_part(data, "}", len(data) - 1)     # known suffix
key = (start + end)[:5]

print("Key:   ", key)
print("Flag 1:", xor_decrypt(data, key))
```

Here it is against a ciphertext I made with a fake flag and key, so nothing from the real room ends up on this page:

```console
$ python3 solve.py \
  257f1f0146195e21255b026833255f1053372547016834165316683415402e433a1f6d15523f154f
Key:    q7Rz2
Flag 1: THM{this_is_a_made_up_flag_for_the_demo}
```

On the live machine, connect with `nc`, run the solver on the hex it prints, and send the key back over the same connection. A new connection means a new key, so keep that one open until you are done.

## The lesson

Five known bytes against a five-byte repeating key is the entire attack. A short repeating XOR key gives itself away as soon as part of the plaintext is predictable, and plaintext is predictable more often than you would think.
