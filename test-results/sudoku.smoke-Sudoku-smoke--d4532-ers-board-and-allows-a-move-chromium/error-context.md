# Page snapshot

```yaml
- text: "[plugin:vite:esbuild] Transform failed with 1 error: C:/Users/NeilGroulx/OneDrive - cynnix.com/Tech/Cursor/td5000/src/scenes/Game.ts:141:55: ERROR: Expected identifier but found \"[\" C:/Users/NeilGroulx/OneDrive - cynnix.com/Tech/Cursor/td5000/src/scenes/Game.ts:141:55 Expected identifier but found \"[\" 139| this.turret = new TempTurret(this, safe.x + safe.width * 0.5, safe.y + safe.height * 0.75); 140| this.missilePool = new EntityPool<Missile>({ 141| create: () => new Missile(this, this.turret!.['pos']?.x ?? 0, this.turret!.['pos']?.y ?? 0), | ^ 142| onAcquire: (m) => m.setActive(true).setVisible(true), 143| onRelease: (m) => m.setActive(false).setVisible(false), at failureErrorWithLog (C:\\Users\\NeilGroulx\\OneDrive - cynnix.com\\Tech\\Cursor\\td5000\\node_modules\\esbuild\\lib\\main.js:1472:15) at C:\\Users\\NeilGroulx\\OneDrive - cynnix.com\\Tech\\Cursor\\td5000\\node_modules\\esbuild\\lib\\main.js:755:50 at responseCallbacks.<computed> (C:\\Users\\NeilGroulx\\OneDrive - cynnix.com\\Tech\\Cursor\\td5000\\node_modules\\esbuild\\lib\\main.js:622:9) at handleIncomingPacket (C:\\Users\\NeilGroulx\\OneDrive - cynnix.com\\Tech\\Cursor\\td5000\\node_modules\\esbuild\\lib\\main.js:677:12) at Socket.readFromStdout (C:\\Users\\NeilGroulx\\OneDrive - cynnix.com\\Tech\\Cursor\\td5000\\node_modules\\esbuild\\lib\\main.js:600:7) at Socket.emit (node:events:507:28) at addChunk (node:internal/streams/readable:559:12) at readableAddChunkPushByteMode (node:internal/streams/readable:510:3) at Readable.push (node:internal/streams/readable:390:5) at Pipe.onStreamRead (node:internal/stream_base_commons:189:23 Click outside, press Esc key, or fix the code to dismiss. You can also disable this overlay by setting"
- code: server.hmr.overlay
- text: to
- code: "false"
- text: in
- code: vite.config.ts
- text: .
```