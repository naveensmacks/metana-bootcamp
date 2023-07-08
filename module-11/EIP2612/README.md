# EIP2612  
Run any http server and in the console run the main function   
await main()  
click metamask in the prompt and EIP712 typed signed message will be displayed and after clicking on sign r,s,v values will be logged in the console  

r: 0x78bb01bf96ba1a9ddc708dc27e7b1cf69e1259f8773d592150dd725579fc650f, s: 0x0a5cee73d4899cde11587f04aba942e20bf2a5c2d871531f5da0df8c477c8eee, v: 27, sig: 0x78bb01bf96ba1a9ddc708dc27e7b1cf69e1259f8773d592150dd725579fc650f0a5cee73d4899cde11587f04aba942e20bf2a5c2d871531f5da0df8c477c8eee1b  

Using the r,s,v values call the permit function in the contract to set the spender allowance limit