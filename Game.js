var GameCharacter;
var Background;
var Foreground;
var RestartButton;
var RestartText;
var HealthBar;
var EngineBooster;
var BoosterSound;
var HyperspaceSound;
var MainMusic;

var GameContext = "";
let GameObjects = [];
let GameSounds = [];
var KeyPressed = false;
var Clicked = false;
var MousePosition = [0,0];
var SceneChanged = false;
let MoveKeysPressed = [false,false,false];
let Firing = false;
var AstroidsPresent = 0;
var SpawnAsteroids = false;
var MaxAstroids = 60;
const ScreenWidth = 1080
const ScreenHeight = 700
var XDisplacement = 0;
var YDisplacement = 0;
var DeleteObjStack = [];
var AddObjStack = [];
var GameTicks = 0;
var PoemNumber = 0;
var Poems = ["Hello"];
var DisableControls = false;
let GameTargetPosition = [-100,-100]
var AsteroidAsset = "Asteroid";
var RestartingScene = "Tutorial";

//Crystal sector
AsteroidWaitTime = 10;
AsteroidMoveTime = 10;
var CrystalAsteroidDirection = 20;
var AsteroidCrystalMove = false;
var CrystalBlinking = false;
var InitialSpawn = true;
var LastBlinkTick = 0;
var SwitchTimerResets = [];

const TickPerSecond = 20;



const ImgPaths = {
    "Character": "Assets/Character.png" ,
    "MainCharacter" : "Assets/MainCharacter.png",
    "Background":  "Assets/Background.jpg",
    "Asteroid":  "Assets/Asteroid.png",
    "CrystalAsteroid":   "Assets/CrystalAsteroid.png",
    "ActivatedCrystal":  "Assets/CrystalAsteroid2.png",
    "AsterFragment" :  "Assets/AsteroidFragment.png",
    "Bullet" : "Assets/Bullet.png",
    "Fire1" : "Assets/Animations/Fire/Fire1.png",
    "Fire2" : "Assets/Animations/Fire/Fire2.png",
    "BlackBackground" : "Assets/BlackBackground.png",
    "CrystalBackground" : "Assets/CrystalBackground.png",
    "SemiTransparent" : "Assets/SemiTransparent.png",
    "MenuBackground" : "Assets/MenuBackground.png",
    "EnergyCell" : "Assets/EnergyCell.png",
    "Play" : "Assets/LaunchButton.png",
    "Restart" : "Assets/RButtonText.png"
};

const Animations =
    {
        "BeginningAnimation" : "Assets/Animations/InitialAnimation/Ani",
        "EndingAnimation" : "Assets/Animations/Ending/Ending",
        "SectorAnimation" : "Assets/Animations/SectorAni/SectorAni",
    };

const Assets = {};

for (const [key, path] of Object.entries(ImgPaths)) {
    const img = new Image();
    img.src = path;
    Assets[key] = img;
}

var SoundSrcs = {
    "Shooting" : "Assets/Sounds/Shot.mp3",
    "Thruster" : "Assets/Sounds/Thruster.mp3",
    "Crash" : "Assets/Sounds/AsteroidCrash.mp3",
    "Shatter" : "Assets/Sounds/Shatter.mp3",
    "Hyperspace" : "Assets/Sounds/Hyperspace.mp3",
    "FabricOfSpace" : "Assets/Sounds/FabricofSpace.mp3",
    "HeartOfEternity" : "Assets/Sounds/HeartofEternity.mp3"
}
//Records of sprites hold FrameWidth,FrameHeight,SpriteLength,AniSpeed(in ticks)
var SpritesSrc = {
    "Explosion" : ["Assets/Sprites/Explosion/Explosion.png",199,239,7,10],
    "Explosion2" : ["Assets/Sprites/Explosion/Explosion2.png",199,239,7,10]
}
const Sprites = {};

for (const [key, path] of Object.entries(SpritesSrc)) {
    const img = new Image();
    img.src = path[0];
    Sprites[key] = img;
}


class Line
{
    constructor(x0,y0,x1,y1,colour, width,ctx)
    {
        this.X0 = x0;
        this.Y0 = y0;
        this.X1 = x1;
        this.Y1 = y1;
        this.colour = colour;
        this.width = width;
        this.ctx = ctx;
    }
    update()
    {
        this.ctx.beginPath();
        this.ctx.moveTo(this.X0, this.Y0);
        this.ctx.lineTo(this.X1, this.Y1);
        this.ctx.lineWidth = this.width;
        this.ctx.strokeStyle = this.colour;
        this.ctx.stroke();
        this.ctx.closePath();
    }
}

class HyperLine extends Line
{
    constructor(length,Angle,ctx) {
        let x0 = Math.random() * ScreenWidth;
        let y0 = Math.random() * ScreenHeight;
        let x1 = x0 + Math.cos(DegToRad(Angle)) * length;
        let y1 = y0 + Math.sin(DegToRad(Angle)) * length;
        super(x0,y0,x1,y1, "white",4, ctx);
        this.length = 300;
        this.OrgLength = 300;
        this.Angle = Angle;
        console.log(Angle);
    }
    handleEffect()
    {
        this.Angle += (GameCharacter.Rotation - this.Angle) * 0.1;
        if (Math.abs(GameCharacter.Rotation - this.Angle) > 180)
        {
            this.Angle = GameCharacter.Rotation;
        }


        if (DistanceBetween(this.X1, this.Y1, GameCharacter.x,GameCharacter.y) < 1000)
        {
            this.length -= 100;
            //console.log("r");
            this.X0 -= 20*Math.cos(DegToRad(this.Angle - 90));
            this.Y0 -= 20*Math.sin(DegToRad(this.Angle - 90));
        }
        else
        {
            this.X0 = GameCharacter.x + Math.cos(DegToRad(Math.random() * (360))) * 2000;
            this.Y0 = GameCharacter.y + Math.sin(DegToRad(Math.random() * (360))) * 2000;
            this.length = this.OrgLength * Math.random();
        }

        this.X1 = this.X0 + Math.cos(DegToRad(this.Angle - 90)) * this.length;
        this.Y1 = this.Y0 + Math.sin(DegToRad(this.Angle - 90)) * this.length;
    }

    update() {
        this.handleEffect();
        super.update();
    }
}
class Sound
{
    constructor(SoundSrc, looping, x, y) {
        this.Source = SoundSrc;
        this.sound = document.createElement("audio");
        this.sound.src = SoundSrcs[this.Source];
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.MaxAudDis = 600
        this.x = x;
        this.y = y
        this.Playing = false;

        this.checkVolume()
        document.body.appendChild(this.sound);
        this.sound.play();

        console.log(looping);
        this.sound.addEventListener('ended', function (event){
            if (looping){
                event.target.currentTime = 0;
            }
            else if (!looping)
            {
                console.log("removing")
                event.target.remove();
            }

        })

    }

    play()
    {
        this.Playing = true;
        this.sound.play();
    }
    checkVolume()
    {
        let distance = DistanceBetween(this.x,this.y, GameCharacter.x, GameCharacter.y)
        if (distance >= 0 && distance <= this.MaxAudDis)
        {
            this.sound.volume = 1 - (distance / this.MaxAudDis);
        }
        else if (distance > this.MaxAudDis)
        {
            this.sound.volume = 0;
        }
    }
    changeSound(NewSound)
    {
        this.sound.src = SoundSrcs[NewSound];
        this.sound.currentTime = 0;
        this.sound.play();
    }
    update()
    {
        if (!this.sound.isConnected)
        {
            GameSounds.splice(GameSounds.indexOf(this),1);
        }
    }
    stop()
    {
        this.Playing = false;
        this.sound.pause();
    }

}

class Text
{
    constructor(x,y,DisplayText,Font,FontSize,Colour,ctx) {
        this.x = x;
        this.y = y;
        this.DisplayText = DisplayText;
        this.Font = Font;
        this.FontSize = FontSize;
        this.Colour = Colour;
        this.Visible = true;
        this.ctx = ctx
    }
    update()
    {
        if (this.Visible)
        {
            this.ctx.font = (this.FontSize + "").concat(" ",this.Font);
            this.ctx.fillStyle = this.Colour;
            this.ctx.fillText(this.DisplayText,this.x,this.y);
        }
    }
}

class StatBar
{
    constructor(x,y,colour, StartingValue,MaxValue, MaxLength, Width,ctx)
    {
        this.x = ScreenWidth / 2 - MaxLength / 2;
        this.y = y;
        this.Margin = 5;
        this.MaxLength = MaxLength;
        this.colour = colour;
        this.MaxValue = MaxValue;
        this.CurrentValue = StartingValue;
        this.CurrentLength = MaxLength * (this.CurrentValue / this.MaxValue);
        this.NumberOfBars = 10;
        this.DividedLength = MaxLength / this.NumberOfBars;
        this.width = 20;
        this.ctx = ctx;

    }

    update()
    {
        if (this.CurrentValue > 0) {
            this.CurrentLength = this.MaxLength * (this.CurrentValue / this.MaxValue);
            this.ctx.fillStyle = this.colour;
            let NumOfBars = this.CurrentLength / this.DividedLength;
            for (let i = 0; i < Math.floor(NumOfBars) ; i++)
            {

                this.ctx.fillRect(this.x + i*this.DividedLength + this.Margin*i, this.y, this.DividedLength, this.width);
            }
            if (NumOfBars > Math.floor(NumOfBars))
            {
                this.ctx.fillRect(this.x + Math.floor(NumOfBars)*this.DividedLength, this.y, this.DividedLength, this.width);
            }

        }
    }
}

//Time given in seconds
class TextTimer extends Text
{
    constructor(x,y,DisplayText,Font,FontSize,Colour,Vis,Function,FuncArgs,CurGameTick,Time,ctx) {
        super(x,y,DisplayText,Font,FontSize,Colour,ctx);
        this.InitialTick = CurGameTick;
        this.TimerLength = Time;

        this.TimerEnded = false;
        this.Visible = false;
        this.Activated = false;
        this.Function = Function;
        this.FuncArgs = FuncArgs;
    }

    update() {
        super.update();
        let TimePast = ticksToSeconds(GameTicks - this.InitialTick);
        if (TimePast < this.TimerLength)
        {
            this.DisplayText = Math.floor(TimePast);
        }
        else if ((this.Function instanceof Function) && this.Activated === false)
        {
            this.Function(this.FuncArgs);
            this.Activated = true;
            DestroyObject(this);
        }
    }
}

class TimerSwitch extends Text
{
    constructor(x,y,DisplayText,Font,FontSize,Colour,Vis,Function,FuncArgs,CurGameTick,Time,ctx) {
        super(x,y,DisplayText,Font,FontSize,Colour,ctx);
        this.InitialTick = CurGameTick;
        this.TimerLength = Time;

        this.TimerEnded = false;
        this.Visible = Vis;
        this.Activated = false;
        this.Switch = true;
        this.Function = Function;
        this.FuncArgs = FuncArgs;
    }

    update() {
        super.update();
        let TimePast = ticksToSeconds(GameTicks - this.InitialTick);
        if (TimePast < this.TimerLength)
        {
            this.DisplayText = Math.floor(TimePast);
        }
        else if (this.Function instanceof Function && !this.Activated)
        {
            this.Activated = true;
            this.Function(this.Switch);
            this.Switch = !this.Switch;
        }
        if (SwitchTimerResets.length > 0)
        {
            SwitchTimerResets.pop();
            this.Activated = false;
            this.InitialTick = GameTicks;
        }
    }
}
class ScreenImageButton
{
    constructor(AssetName,x,y, width,ClickFunction,FuncArgs, height,ActivateOnce,ctx) {
        this.Image = Assets[AssetName];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.Function = ClickFunction;
        this.FuncArgs = FuncArgs;
        this.ActivateOnce = ActivateOnce;
        this.Visible = true;
        this.ctx = ctx;
    }
    CheckClicked()
    {
        if (Clicked)
        {
            if (MousePosition[0] >= this.x && MousePosition[0] <= this.x + this.width && MousePosition[1] >= this.y && MousePosition[1] <= this.y + this.height)
            {
                if (this.ActivateOnce)
                {
                    DestroyObject(this);
                }
                this.Function(this.FuncArgs);
            }
        }
    }

    update()
    {
        if (this.Visible)
        {
            this.CheckClicked();
            this.ctx.drawImage(this.Image,this.x, this.y,this.width, this.height);
        }
    }

}

class DestinationPointer
{
    constructor(AssetName,x,y, ctx)
    {
        this.CenterX = x;
        this.CenterY = y;
        this.DistanceFromCent = 100;
        this.Rotation = 0;
        this.width = 30;
        this.height = 30;
        this.Image = Assets[AssetName];
        this.ctx = ctx;
    }
    handleRotation()
    {
        this.Rotation = angleFromCenter(this.CenterX,this.CenterY, GameTargetPosition[0] + XDisplacement, GameTargetPosition[1]+ YDisplacement);

    }
    update()
    {
        this.handleRotation();
        this.ctx.save();
        this.ctx.translate(this.CenterX, this.CenterY);
        this.ctx.rotate(this.Rotation);
        this.ctx.drawImage(this.Image,0, -this.DistanceFromCent, this.width, this.height);
        this.ctx.restore();
    }
}
class SpriteAnimation
{
    constructor(AniName, x,y,width, height, Looping,DestroyWhenFinished,Displacable, ctx)
    {
        this.Image = Sprites[AniName];
        this.x = x;
        this.y = y;
        this.CurDisX = XDisplacement;
        this.CurDisY = YDisplacement;
        this.width = width;
        this.height = height;
        this.Looping = Looping;
        this.DestroyWhenFinished = DestroyWhenFinished;
        this.Displaceable = Displacable;
        this.LastTick = GameTicks;
        this.CurrentFrame = 0;
        this.FrameRate = SpritesSrc[AniName][4];
        this.FrameWidth = SpritesSrc[AniName][1]
        this.FrameHeight = SpritesSrc[AniName][2];
        this.FrameX = 0;
        this.FrameY = 0;
        this.Length = SpritesSrc[AniName][3]
        this.ctx = ctx;
    }
    HandleSprite()
    {
        if (this.CurrentFrame < this.Length && this.FrameRate <= (GameTicks - this.LastTick))
        {
            this.CurrentFrame++;
            this.FrameX += (this.FrameWidth * this.CurrentFrame);
            this.LastTick = GameTicks;
        }
        else if (this.CurrentFrame >= this.Length)
        {
            DestroyObject(this);
        }

        this.x += (XDisplacement - this.CurDisX);
        this.y += (YDisplacement - this.CurDisY);
        this.CurDisX = XDisplacement;
        this.CurDisY = YDisplacement;
    }
    update()
    {
        this.HandleSprite();
        this.ctx.drawImage(this.Image, this.FrameX, this.FrameY, this.FrameWidth, this.FrameHeight,this.x, this.y,this.width, this.height);
    }

}

class BackgroundImage
{
    constructor(x,y,width, height,Img, ctx)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ctx = ctx
        this.Image = Assets[Img];
        this.CurDisX = 0;
        this.CurDisY = 0;
        this.Sensitivity = 0.2;
    }
    HandleMovement()
    {
        this.x += (XDisplacement - this.CurDisX)* this.Sensitivity;
        this.y += (YDisplacement - this.CurDisY)* this.Sensitivity;
        this.CurDisX = XDisplacement;
        this.CurDisY = YDisplacement;
    }
    update()
    {
        this.HandleMovement();
        this.ctx.drawImage(this.Image, this.x, this.y);
    }
}

class ForegroundImage extends BackgroundImage
{
    constructor(x,y,width, height,Img,Vis, ctx) {
        super(x,y,width, height,Img, ctx);
        this.Visible = Vis;
    }
    update() {
        if (this.Visible)
        {
            this.ctx.drawImage(this.Image, this.x, this.y);
        }
    }
}

class CutScene extends  ForegroundImage
{
    constructor(x,y,width, height,SourceName,Vis,FPS,NumOfFrames, ctx) {
        super(x,y,width, height,"BlackBackground",Vis, ctx);
        this.FrameNum = 0;
        this.Source = Animations[SourceName];
        this.InitalTick = GameTicks;
        this.ImgFrames = [];
        this.SecondsPerFrame = 1 / FPS;
        this.NumOfFrames = NumOfFrames;
        this.loadAnimation();
    }
    loadAnimation()
    {
        for (let i = 0; i < this.NumOfFrames; i++)
        {
            let curImg = new Image();
            curImg.src = this.Source + i + ".jpg";
            console.log(curImg.src)
            this.ImgFrames.push(curImg);
        }
    }
    handAnimation()
    {
        if (ticksToSeconds(GameTicks - this.InitalTick) >= this.SecondsPerFrame && this.FrameNum < this.NumOfFrames)
        {
            this.InitalTick = GameTicks;
            console.log(this.Source + this.FrameNum + ".png")
            this.Image = this.ImgFrames[this.FrameNum]
            this.FrameNum++;
        }
    }

    update() {
        this.handAnimation();
        if (this.Visible)
        {
            this.ctx.drawImage(this.Image, this.x, this.y,1080,700);
        }
    }
}
class Bullet
{
    constructor(x,y,Rotation,width, height, ctx)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.Rotation = -Rotation;
        this.Image = Assets["Bullet"];
        this.Speed = -30;
        this.ctx = ctx;
        this.CurDisX = XDisplacement;
        this.CurDisY = YDisplacement;
        this.Collidable = true;
    }

    HandleMovement() {
        let SpeedY = this.Speed * Math.cos(DegToRad(this.Rotation));
        let SpeedX = this.Speed * Math.sin(DegToRad(this.Rotation));
        this.x += SpeedX + (XDisplacement - this.CurDisX);
        this.y += SpeedY + (YDisplacement - this.CurDisY);
        this.CurDisX = XDisplacement;
        this.CurDisY = YDisplacement;

    }

    HandleCollision()
    {
        const ColRadius = RadiusFromDim(this.width, this.height);
        let CenterX = this.x + (this.width/2);
        let CenterY = this.y + (this.height/2);

        if (this.Collidable)
        {
            for (let i = 0; i < GameObjects.length; i++) {
                if (!(GameObjects.indexOf(this) === i) && GameObjects[i] instanceof Asteroid){
                    let ColRadiusObj = RadiusFromDim(GameObjects[i].width, GameObjects[i].height);
                    let ObCentX = GameObjects[i].x + (GameObjects[i].width / 2);
                    let ObCentY = GameObjects[i].y + (GameObjects[i].height / 2);

                    let Distance = DistanceBetween(CenterX, CenterY, ObCentX , ObCentY);
                    if (Distance <= ColRadiusObj + ColRadius) {

                        GameObjects[i].Explode = true;
                        DeleteObjStack.push(this);
                        break;
                    }
                }
            }
        }
    }
    update()
    {
        this.HandleMovement();
        this.HandleCollision();
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(DegToRad( 360 - this.Rotation));
        this.ctx.drawImage(this.Image,-this.width / 2, -this.height / 2, this.width, this.height);
        this.ctx.restore();
    }
}

class Asteroid
{
    constructor(AssetName,width, height, ctx)
    {
        this.Image = Assets[AssetName];
        this.RangeFromScreenEdge = 100;
        this.width = width;
        this.height = height;
        this.Rotation = Math.random() * 360;
        this.ImageRotation = 90;
        this.ImageRotationSpeed = 1 - 2* Math.random();
        this.Speed = Math.random() * 6;
        this.ctx = ctx;
        this.DestroyDis = 1100;
        this.CurDisX = 0;
        this.CurDisY = 0;
        this.Collidable = true;
        this.Explode = false;

        this.findSpawnLocation();

        this.CurDisY = YDisplacement;
        this.CurDisX = XDisplacement;

        this.HandleCollisions();
        if (this.Explode)
        {
            this.Explode = false;
            DestroyObject(this);
            AstroidsPresent -= 1;
        }
    }

    findSpawnLocation()
    {
        let MaxDisFromPlayer = 0;
        let MinDisFromPlayer = 700;
        let RandomAngle = 360 * Math.random();

        let MovingSpawnAngle = 50;

        this.x = GameCharacter.x + Math.cos(DegToRad(RandomAngle)) * (MinDisFromPlayer + MaxDisFromPlayer * Math.random());
        this.y = GameCharacter.y + Math.sin(DegToRad(RandomAngle)) * (MinDisFromPlayer + MaxDisFromPlayer * Math.random());
        /**let RandomZone = parseInt(Math.random() * 5);
        if (RandomZone === 0)
        {
            this.x = ScreenWidth * Math.random();
            this.y = -this.RangeFromScreenEdge - this.RangeFromScreenEdge * Math.random();
        }
        else if (RandomZone === 1)
        {
            this.x = ScreenWidth + this.RangeFromScreenEdge * Math.random();
            this.y = ScreenHeight * Math.random();
        }
        else if (RandomZone === 2)
        {
            this.x = ScreenWidth  * Math.random();
            this.y = ScreenHeight + this.RangeFromScreenEdge * Math.random();
        }
        else
        {
            this.x = -this.RangeFromScreenEdge - this.RangeFromScreenEdge * Math.random();
            this.y = ScreenHeight * Math.random();
        }**/
    }

    rotateAsteroid()
    {
        this.ImageRotation += this.ImageRotationSpeed;

        if (this.ImageRotation < 0)
        {
            this.ImageRotation = 360;
        }
        else if (this.ImageRotation > 360)
        {
            this.ImageRotation = 0;
        }
    }

    update()
    {
        this.checkExplosion();
        this.rotateAsteroid();
        this.HandleCollisions();
        this.HandleMovement();
        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        this.ctx.rotate(DegToRad(this.ImageRotation));
        this.ctx.drawImage(this.Image,-this.width / 2, -this.height / 2);
        this.ctx.restore();
        this.checkDestroyDistance();
    }

    HandleMovement()
    {
        let SpeedY = this.Speed * Math.cos(DegToRad(this.Rotation));
        let SpeedX = this.Speed * Math.sin(DegToRad(this.Rotation));
        if (this.color === "red")
        {
            this.SpeedX = 0;
            this.SpeedY = 0;
            this.x = XDisplacement;
            this.y = YDisplacement;
        }
        this.x += SpeedX + (XDisplacement - this.CurDisX);
        this.y += SpeedY + (YDisplacement - this.CurDisY);
        this.CurDisX = XDisplacement;
        this.CurDisY = YDisplacement;
    }

    checkExplosion()
    {
        if (this.Explode)
        {
            let IsDestroying = DestroyObject(this);
            if (!IsDestroying)
            {
                AstroidsPresent -= 1;
                spawnMiniAsteroids("", this.x, this.y,this.width, this.height);
                GameSounds.push(new Sound("Crash",false,this.x,this.y))
                AddObjStack.push(new SpriteAnimation("Explosion", this.x,this.y,120, 120, false,true,true, GameContext));
            }
        }
    }

    checkDestroyDistance()
    {
        let Distance = DistanceBetween(GameCharacter.x, GameCharacter.y, this.x, this.y)

        if (Distance > this.DestroyDis)
        {
            let IsDestroying = DestroyObject(this);
            if (!IsDestroying && !(this.constructor === MinAsteroid))
            {
                AstroidsPresent -= 1;
            }
        }
    }

    HandleCollisions()
    {
        const ColRadius = RadiusFromDim(this.width, this.height);
        let CenterX = this.x + (this.width/2);
        let CenterY = this.y + (this.height/2);

        if (this.Collidable)
        {
            for (let i = 0; i < GameObjects.length; i++) {
                if (!(GameObjects.indexOf(this) === i) && !(GameObjects[i].constructor === MinAsteroid) && !(GameObjects[i].constructor === SpriteAnimation) && !(checkIfDestroying(GameObjects[i]))){

                    let ColRadiusObj = RadiusFromDim(GameObjects[i].width, GameObjects[i].height);
                    let ObCentX = GameObjects[i].x + (GameObjects[i].width / 2);
                    let ObCentY = GameObjects[i].y + (GameObjects[i].height / 2);

                    let Distance = DistanceBetween(CenterX, CenterY, ObCentX , ObCentY);
                    //console.log(Distance);
                    if (Distance <= ColRadiusObj + ColRadius) {

                        this.Explode = true;
                        break;
                    }
                }
            }
        }
    }

}

class CrystalAsteroid extends Asteroid
{
    constructor(AssetName,width, height, ctx) {
        super(AssetName,width, height, ctx);
        this.Rotation = CrystalAsteroidDirection;
        this.MaxSpeed = 5;
        this.Accerlation = 0.05 + 0.05 * Math.random();
        this.Speed = 0;
        this.DestroyDis = 750;
        this.CrystalActivated = false;
        this.LastBlinkTick = GameTicks;
        this.MaxBlinkTime = 1;
        this.blinkAcc = 0.1;
        this.SecondsBetweenBlink = 1;
        this.AssetName = AssetName;
        //this.findSpawnLocation();
        this.findSpawnLocation();
        this.HandleCollisions();
        let count = 0;
        for (let i = 0; i < 100; i++) {
            if (this.Explode)
            {
                this.Explode = false;
                this.findSpawnLocation();
                this.HandleCollisions();
            }
            else
            {
                break;
            }
            count++;
        }

        if (this.Explode )
        {

            if (InitialSpawn){
                GameObjects.splice(GameObjects.indexOf(this),1)
            }
            else
            {
                DestroyObject(this);
            }

        }
        if (CrystalBlinking)
        {
            this.SecondsBetweenBlink = -0.1;
        }



    }

    blink()
    {
        if (ticksToSeconds(GameTicks - this.LastBlinkTick) >= this.SecondsBetweenBlink && this.SecondsBetweenBlink >= 0)
        {
            if (!this.CrystalActivated) {
                this.CrystalActivated = true;
                this.AssetName = "ActivatedCrystal";
                this.Image = Assets["ActivatedCrystal"];
            } else {
                this.CrystalActivated = false;
                this.AssetName = "CrystalAsteroid"
                this.Image = Assets["CrystalAsteroid"];
            }
            this.SecondsBetweenBlink -= this.blinkAcc;
            this.LastBlinkTick = GameTicks;
        }
        else if (this.SecondsBetweenBlink <= 0)
        {
            this.AssetName = "ActivatedCrystal";
            this.Image = Assets["ActivatedCrystal"];
        }
    }

    findSpawnLocation() {
        //super.findSpawnLocation();
        let MaxDisFromPlayer = 0;
        let MinDisFromPlayer = 700;
        let RandomAngle = 360 * Math.random();


        if (InitialSpawn)
        {
            MaxDisFromPlayer = 330;
            MinDisFromPlayer = 300;
        }
        let MovingSpawnAngle = 50;

        this.x = GameCharacter.x + Math.cos(DegToRad(RandomAngle)) * (MinDisFromPlayer + MaxDisFromPlayer * Math.random());
        this.y = GameCharacter.y + Math.sin(DegToRad(RandomAngle)) * (MinDisFromPlayer + MaxDisFromPlayer * Math.random());
        //console.log(this.x,this.y);
    }

    rotateAsteroid() {
        super.rotateAsteroid();
    }

    checkExplosion() {
        if (this.Explode)
        {
            let IsDestroying = DestroyObject(this);
            if (!IsDestroying)
            {
                AstroidsPresent -= 1;
                spawnMiniCrystalAsteroids(this.AssetName, this.x, this.y,this.width, this.height);
                GameSounds.push(new Sound("Shatter",false,this.x,this.y));
                AddObjStack.push(new SpriteAnimation("Explosion2", this.x,this.y,90, 90, false,true,true, GameContext));
            }
        }
    }

    checkDestroyDistance() {
        super.checkDestroyDistance();
    }

    update() {
        if (CrystalBlinking)
        {
            this.blink();
        }
        else
        {
            this.SecondsBetweenBlink = this.MaxBlinkTime;
            this.Image = Assets["CrystalAsteroid"];
            this.AssetName = "CrystalAsteroid";
        }
        if (AsteroidCrystalMove && this.Speed < this.MaxSpeed)
        {
            this.Rotation = CrystalAsteroidDirection;
            this.Speed += this.Accerlation;
        }
        else if (this.Speed > 0 && !AsteroidCrystalMove)
        {
            this.Speed -= this.Accerlation;
        }

        super.update();
    }

    HandleMovement() {
        super.HandleMovement();
    }

    HandleCollisions() {
        super.HandleCollisions();
    }
}
class MinAsteroid extends Asteroid
{
    constructor(AssetName,x, y, width, height, ctx) {
        super(AssetName,width, height, ctx);
        this.AssetName = AssetName;
        this.x = x;
        this.y = y;
        this.DestroyDis = 1500;
        this.ImageRotation = 0;
    }

    rotateAsteroid() {
        super.rotateAsteroid();
    }

    HandleMovement() {
        super.HandleMovement();
    }
    checkDestroyDistance() {
        super.checkDestroyDistance();
    }

    checkExplosion() {
        if (this.Explode)
        {
            let IsDestroying = DestroyObject(this);
            if (!IsDestroying) {
                if (this.AssetName === "ActivatedCrystal" || this.AssetName === "ActivatedCrystal") {
                    AddObjStack.push(new SpriteAnimation("Explosion2", this.x, this.y, this.width + 10, this.height + 10, false, true, true, GameContext));
                }
            }
        }
    }

    HandleCollisions() {
        const ColRadius = RadiusFromDim(this.width, this.height);
        let CenterX = this.x + (this.width/2);
        let CenterY = this.y + (this.height/2);

        if (this.Collidable)
        {
            for (let i = 0; i < GameObjects.length; i++) {
                if (!(GameObjects.indexOf(this) === i) && !(GameObjects[i] instanceof SpriteAnimation) && !(checkIfDestroying(GameObjects[i])))
                {
                    let ColRadiusObj = RadiusFromDim(GameObjects[i].width, GameObjects[i].height);
                    let ObCentX = GameObjects[i].x + (GameObjects[i].width / 2);
                    let ObCentY = GameObjects[i].y + (GameObjects[i].height / 2);

                    let Distance = DistanceBetween(CenterX, CenterY, ObCentX , ObCentY);
                    //console.log(Distance);
                    if (Distance <= ColRadiusObj + ColRadius) {
                        //this.Speed = -this.Speed;
                        this.Explode = true;
                    }
                }
            }
        }
    }

    update() {
        this.checkExplosion();
        this.rotateAsteroid();
        this.HandleCollisions();
        this.HandleMovement();
        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        this.ctx.rotate(DegToRad(this.ImageRotation));
        this.ctx.drawImage(this.Image,-this.width / 2, -this.height / 2, this.width, this.height);
        this.ctx.restore();
        this.checkDestroyDistance();
    }
}

class Character
{
    constructor(width, height, x, y, ctx) {
        this.width = width;
        this.height = height;
        this.Health = 100;
        this.MaxHealth = 100;
        this.SpeedX = 0;
        this.SpeedY = 0;
        this.Rotation = 0;
        this.RotationSpeed = 2;
        this.Visible = true;
        this.Acceleration = 0.2;
        this.DisableControls = false;
        this.Deceleration = 0.05;
        this.Speed = 0;
        this.RotDirection = 0;
        this.MaxSpeed = 4;
        this.ctx = ctx;
        this.orgX = x - width / 2;
        this.orgY = y - height / 2;
        this.x = x - width / 2;
        this.y = y - height / 2;
        this.Image = Assets["MainCharacter"];
        this.Collidable = true;
    }

    update()
    {
        if (this.Health <= 0)
        {
            playerDeath();
            this.DisableControls = true;
        }
        if (!this.DisableControls)
        {
            this.HandleMovement();
        }
        if (this.Visible)
        {
            this.HandleCollision();
            this.ctx.save();
            this.ctx.translate(this.x + this.width/2, this.y + this.height/2);
            this.ctx.rotate(DegToRad(this.Rotation));
            this.ctx.drawImage(this.Image,-this.width/2, -this.height/2);
            this.ctx.restore();
        }
    }

    HandleMovement()
    {

        if (MoveKeysPressed[1])
        {
            this.RotDirection = 1;
            this.Rotation += this.RotationSpeed;
            if (this.Rotation > 360)
            {
                this.RotDirection = 0;
                this.Rotation = this.RotationSpeed;
            }

        }
        if (MoveKeysPressed[0])
        {
            this.RotDirection = -1;
            this.Rotation -= this.RotationSpeed;

            if (this.Rotation > 360)
            {
                this.RotDirection = 0;
                this.Rotation = this.RotationSpeed;
            }
            if (this.Rotation < 0)
            {
                this.RotDirection = 0;
                this.Rotation = 360 - this.RotationSpeed;
            }


        }

        if (MoveKeysPressed[2] && this.Speed < this.MaxSpeed)
        {
            BoosterSound.play();
            this.Speed += 0.1;

        }
        else if (this.Speed >= 0)
        {
            this.Speed -= this.Deceleration;
        }
        if (this.Speed < 0)
        {
            this.Speed = 0;
        }

        if (!MoveKeysPressed[2])
        {
            BoosterSound.stop();
        }

        this.SpeedY = this.Speed * Math.cos(DegToRad(this.Rotation));
        this.SpeedX = this.Speed * Math.sin(DegToRad(this.Rotation));
        
        XDisplacement -= this.SpeedX;
        YDisplacement += this.SpeedY;
    }

    HandleCollision()
    {
        const ColRadius = RadiusFromDim(this.width, this.height);
        let CenterX = this.x + (this.width/2);
        let CenterY = this.y + (this.height/2);

        if (this.Collidable)
        {
            for (let i = 0; i < GameObjects.length; i++) {
                if (!(GameObjects.indexOf(this) === i) && GameObjects[i] instanceof Asteroid){
                    let ColRadiusObj = RadiusFromDim(GameObjects[i].width, GameObjects[i].height);
                    let ObCentX = GameObjects[i].x + (GameObjects[i].width / 2);
                    let ObCentY = GameObjects[i].y + (GameObjects[i].height / 2);

                    let Distance = DistanceBetween(CenterX, CenterY, ObCentX , ObCentY);
                    if (Distance <= ColRadiusObj + ColRadius && !GameObjects[i].Explode) {

                        GameObjects[i].Explode = true;
                        console.log(this.Health);
                        if (GameObjects[i].constructor === Asteroid || GameObjects[i].constructor === CrystalAsteroid)
                        {
                            this.Health -= 50;
                        }
                        else if (GameObjects[i].constructor === MinAsteroid)
                        {
                            this.Health -= 10;
                        }
                    }
                }
            }
        }
    }
}

class Booster extends DestinationPointer{
    constructor(AssetName,width,height, ctx) {
        super(AssetName,GameCharacter.x + GameCharacter.width / 2,GameCharacter.y + GameCharacter.height / 2, ctx);
        this.height = height;
        this.width = width;
        this.Flipped = false;
        this.Image1 = Assets["Fire1"];
        this.Image2 = Assets["Fire2"];
        this.DistanceFromCent = height;
        this.FrameRate = 0.5;
        this.LastTick = GameTicks;
        this.Visible = true;
    }
    handleRotation() {
        this.Rotation = GameCharacter.Rotation;
    }

    handleAnimation()
    {
        if (ticksToSeconds(GameTicks - this.LastTick) >= this.FrameRate)
        {
            if (this.Flipped)
            {
                this.Image = this.Image1;
                this.Flipped = false;
            }
            else
            {
                this.Image = this.Image2;
                this.Flipped = true;
            }
            this.LastTick = GameTicks;
        }
    }

    update() {
        this.handleRotation();
        if (MoveKeysPressed[2] && this.Visible)
        {
            this.handleAnimation()
            this.ctx.save();
            this.ctx.translate(this.CenterX, this.CenterY);
            this.ctx.rotate(DegToRad(this.Rotation));
            this.ctx.drawImage(this.Image,-10, 10, this.width, this.height);
            this.ctx.restore();
        }
    }
}

class TargetPoint
{
    constructor(AssetName,x,y,ArrivalFunction,FuncArgs,ctx) {
        this.x = x;
        this.y = y;
        this.Image = Assets[AssetName];
        this.MinDistance = 200;
        this.ArrivalFunction = ArrivalFunction;
        this.FuncArgs = FuncArgs;
        this.CurDispX = XDisplacement;
        this.CurDispY = YDisplacement;
        this.ctx = ctx;
    }

    update()
    {
        this.x += (-this.CurDispX + XDisplacement);
        this.y += (-this.CurDispY + YDisplacement);
        this.CurDispX = XDisplacement;
        this.CurDispY = YDisplacement;

        let Distance = DistanceBetween(this.x,this.y,GameCharacter.x, GameCharacter.y);
        if (Distance < this.MinDistance)
        {
            this.ArrivalFunction(this.FuncArgs);
        }

        this.ctx.drawImage(this.Image, this.x, this.y);

    }
}


function initiateGame()
{
    document.fonts.add(new FontFace("RobotInvaders", "url('./Assets/Fonts/RobotInvaders.ttf')"));
    MainGameArea.start();
    ChangeScene("Menu");
    //GameCharacter = new Character(100, 100, ScreenWidth / 2 - 50, ScreenHeight / 2 - 50,MainGameArea.context);
    //Background = new BackgroundImage(-1032,-1000,2064, 3000,"Background", MainGameArea.context);
    //AddObjStack.push(new Asteroid(80,80,"red",GameContext));
    //colBlock = new Block(5, 5, "green", 0,0);
    //GameObjects.push(new Block(100, 10,"red", 0,150));
}

function ticksToSeconds(NumOfTicks)
{
    return (NumOfTicks / TickPerSecond);
}

function DegToRad(Degrees)
{
    return Degrees * Math.PI / 180;
}

function RadiusFromDim(Width,Height)
{
    //Math.sqrt(Width*Width + Height*Height) / 2
    let Average = ((Width + Height) / 2) / 2;
    return Average;
}

function checkIfDestroying(ObjectToCheck)
{
    let Found = false;

    for (let i = 0; i < DeleteObjStack.length; i++)
    {
        if (ObjectToCheck === DeleteObjStack[i])
        {
            Found = true;
        }
    }
    return Found;
}
function DestroyObject(ObjectToDestroy)
{
    let Found = checkIfDestroying(ObjectToDestroy);

    if (!Found)
    {
        DeleteObjStack.push(ObjectToDestroy)
    }

    return Found;
}
function DistanceBetween(Point1X, Point1Y, Point2X, Point2Y)
{
    let XSqrDistance = Math.pow(Point1X - Point2X,2);
    let YSqrDistance = Math.pow(Point1Y - Point2Y,2);

    let Distance = Math.sqrt(XSqrDistance + YSqrDistance);

    return Distance;
}

function setCrystalAsteroidMovement(Value)
{
    AsteroidCrystalMove = Value;

}

function setCrystalAsteroidBlink(Value)
{
    CrystalBlinking = Value;
}

function restartSwitchTimers(Value)
{
    SwitchTimerResets.push(true);
    SwitchTimerResets.push(true);
    SwitchTimerResets.push(true);
}

function testFunction(UselessArg)
{
    console.log("Arrived");
}

function angleFromCenter(x0, y0, x, y) {
    let XDiff = Math.abs(x - x0);
    let YDiff = Math.abs(y - y0);
    let angle = Math.atan(YDiff/XDiff);

    if (x < x0 && y < y0)
    {
        angle += Math.PI * (3/2);

    }
    else if (x < x0 && y > y0)
    {
        angle = Math.PI * (3/2) - angle;

    }
    else if (y > y0 && x > x0)
    {
        angle = Math.PI / 2 + angle;

    }
    else
    {
        angle = Math.PI / 2 - angle;
    }

    return angle;
}

function spawnMiniAsteroids(AssetName, X, Y,width, height)
{
    let MinAsteroidWidth = width / 4;
    let MinAsteroidHeight = height / 4;
    let EdgeDistance = 2;
    AddObjStack.push(new MinAsteroid("AsterFragment",X ,Y ,MinAsteroidWidth, MinAsteroidHeight,GameContext));
    //AddObjStack.push(new MinAsteroid(X + width,Y  + height,MinAsteroidWidth, MinAsteroidHeight,"green",GameContext));
}

function spawnMiniCrystalAsteroids(AssetName, X, Y,width, height)
{

    let MinAsteroidWidth = width / 4;
    let MinAsteroidHeight = height / 4;
    let EdgeDistance = 2;
    AddObjStack.push(new MinAsteroid(AssetName,X ,Y ,MinAsteroidWidth, MinAsteroidHeight,GameContext));
    //AddObjStack.push(new MinAsteroid("ActivatedCrystal",X + width,Y, MinAsteroidWidth,MinAsteroidHeight,GameContext));
    AddObjStack.push(new MinAsteroid(AssetName,X,Y + height,MinAsteroidWidth, MinAsteroidHeight,GameContext));
    //AddObjStack.push(new MinAsteroid("ActivatedCrystal",X + width,Y  + height,MinAsteroidWidth, MinAsteroidHeight,GameContext));
}

function hyperDrive()
{
    for (let i = 0; i < 100; i++)
    {
        AddObjStack.push(new HyperLine(70, GameCharacter.Rotation,GameContext));
    }
    HyperspaceSound.play();
}

function restartAtCheckPoint(UA)
{
    if (RestartingScene === "Tutorial")
    {
        ChangeScene("Tutorial");
        ChangeScene("MainGame");
    }
    else
    {
        ChangeScene("Tutorial");
        ChangeScene("CrystalSector");
    }
}

//This function contains all objects for scenes such as the menu.
//

function ChangeScene(Scene)
{
    if (!SceneChanged)
    {
        DeleteObjStack.length = 0;
        GameObjects.length = 0;
        AddObjStack.length = 0;

        if (Scene === "Menu")
        {
            SpawnAsteroids = false;
            Background = new BackgroundImage(0,0,1080, 700,"MenuBackground", MainGameArea.context);
            GameObjects.push(new ScreenImageButton("Play",350,200, 150, ChangeScene,"BeginCutscene",50,true,GameContext))
            GameObjects.push(new Text(200,100,"ASTEROIDS","RobotInvaders","100px","white",GameContext) );
        }
        else if (Scene === "MainGame")
        {
            HyperspaceSound.stop();
            AsteroidAsset = "Asteroid";
            AstroidsPresent = 0;
            MaxAstroids = 60;
            GameCharacter.MaxSpeed = 4;
            GameTargetPosition[0] = -5000;
            GameTargetPosition[1] = -2000;
            //HealthBar = new  StatBar(10,600,"white", GameCharacter.MaxHealth,100, 700, 30,GameContext);
            AddObjStack.push(new TextTimer(100,100,"Hello","Ariel",30,"white",true,false,false,GameTicks,100,GameContext));
            AddObjStack.push(new DestinationPointer("Character",GameCharacter.x + GameCharacter.width/2,GameCharacter.y + GameCharacter.height/2, GameContext));
            AddObjStack.push(new TargetPoint("EnergyCell",GameTargetPosition[0],GameTargetPosition[1],ChangeScene,"Poem",MainGameArea.context));
            Background = new BackgroundImage(-1032,-1000,1022, 1500,"Background", MainGameArea.context);
            SpawnAsteroids = true;
        }
        else if (Scene === "CrystalSector")
        {
            HyperspaceSound.stop();
            MainMusic.changeSound("FabricOfSpace");
            RestartingScene = "CrystalSector"
            XDisplacement = 0;
            YDisplacement = 0;
            AsteroidCrystalMove = false;
            CrystalBlinking = false;
            InitialSpawn = true;
            MaxAstroids = 30;
            AstroidsPresent = 0;
            AsteroidAsset = "CrystalAsteroid";
            GameTargetPosition[0] = -3000;
            GameTargetPosition[1] = 1000;
            for (let i = 0; i < MaxAstroids; i++)
            {
                AddObjStack.push(new CrystalAsteroid(AsteroidAsset,60,120,GameContext));
                AstroidsPresent++;
            }
            InitialSpawn = false;
            MaxAstroids = 110;
            AddObjStack.push(new TimerSwitch(100,100,"Hello","Ariel",30,"white",true,setCrystalAsteroidMovement,true,GameTicks,AsteroidWaitTime,GameContext));
            AddObjStack.push(new TimerSwitch(100,100,"hello","Ariel",10,"white",true,setCrystalAsteroidBlink,true,GameTicks,AsteroidWaitTime - 3,GameContext));
            AddObjStack.push(new TimerSwitch(100,100,"hello","Ariel",10,"white",true,restartSwitchTimers,true,GameTicks,AsteroidWaitTime,GameContext));

            AddObjStack.push(new DestinationPointer("Character",GameCharacter.x + GameCharacter.width/2,GameCharacter.y + GameCharacter.height/2, GameContext));
            AddObjStack.push(new TargetPoint("EnergyCell",GameTargetPosition[0],GameTargetPosition[1],ChangeScene,"EndingCutscene",MainGameArea.context));
            Background = new BackgroundImage(-1700,-1150,1022, 1500,"CrystalBackground", MainGameArea.context);
            GameCharacter.MaxSpeed = 4;
            SpawnAsteroids = true;
        }
        else if (Scene === "Poem" && PoemNumber === 0)
        {
            SpawnAsteroids = false;
            GameCharacter.MaxSpeed = 0;
            Background = new BackgroundImage(-100,-100,1022, 1500,"BlackBackground", MainGameArea.context);
            AddObjStack.push(new TextTimer(100,100,"Hello","Ariel",30,"white",true,ChangeScene,"CrystalSector",GameTicks,10,GameContext));
            AddObjStack.push(new Text(300,300,Poems[PoemNumber],"Ariel","100px","red",GameContext));
            hyperDrive();

            PoemNumber++;
        }
        else if (Scene === "Poem" && PoemNumber === 1)
        {
            SpawnAsteroids = false;
            GameCharacter.MaxSpeed = 0;
            Background = new BackgroundImage(-100,-100,1022, 1500,"BlackBackground", MainGameArea.context);
            AddObjStack.push(new TextTimer(100,100,"Hello","Ariel",30,"white",true,ChangeScene,"Tutorial",GameTicks,10,GameContext));
            AddObjStack.push(new Text(300,300,Poems[PoemNumber],"Ariel","100px","red",GameContext));
            hyperDrive();

            PoemNumber++;
        }
        else  if ( Scene === "BeginCutscene")
        {
            SpawnAsteroids = false;
            AddObjStack.push(new CutScene(0,0,20, 20,"BeginningAnimation",true,10,145, MainGameArea.context))
            AddObjStack.push(new TextTimer(100,100,"Hello","Ariel",30,"white",true,ChangeScene,"Sector1Cutscene",GameTicks,16,GameContext));
        }
        else  if ( Scene === "Sector1Cutscene")
        {
            SpawnAsteroids = false;
            AddObjStack.push(new CutScene(0,0,20, 20,"SectorAnimation",true,10,49, MainGameArea.context))
            AddObjStack.push(new TextTimer(100,100,"Hello","Ariel",30,"white",true,ChangeScene,"Tutorial",GameTicks,9,GameContext));
        }
        else  if ( Scene === "EndingCutscene")
        {
            SpawnAsteroids = false;
            SpawnAsteroids = false;
            GameCharacter.Visible = false;
            AddObjStack.push(new CutScene(0,0,20, 20,"EndingAnimation",true,10,99, MainGameArea.context))
            //AddObjStack.push(new TextTimer(100,100,"Hello","Ariel",30,"white",false,ChangeScene,"Tutorial",GameTicks,18,GameContext));
        }
        else if (Scene === "Tutorial")
        {
            SpawnAsteroids = false;
            XDisplacement = 0;
            YDisplacement = 0;
            PoemNumber = 0;
            AsteroidAsset = "Asteroid";
            GameCharacter = new Character(60, 123, ScreenWidth / 2, ScreenHeight / 2,MainGameArea.context);
            GameCharacter.MaxSpeed = 0;
            Foreground = new ForegroundImage(0,0,ScreenWidth, ScreenHeight,"SemiTransparent",false,MainGameArea.context);
            RestartButton = new ScreenImageButton("Restart",500,500,100,restartAtCheckPoint,"",50,true,MainGameArea.context)
            RestartButton.Visible = false
            RestartText = new Text(100,250,"Crashed", "RobotInvaders","200px","red",MainGameArea.context);
            RestartText.Visible = false;
            Background = new BackgroundImage(-100,-100,1022, 1500,"BlackBackground", MainGameArea.context);
            HealthBar = new  StatBar(10,600,"white", GameCharacter.MaxHealth,100, 100, 30,GameContext);
            EngineBooster = new Booster("Fire1",20,60, GameContext);
            if (BoosterSound)
            {
                if (BoosterSound.sound.isConnected)
                {
                    BoosterSound.sound.remove();
                }
            }
            if (MainMusic)
            {
                if (MainMusic.sound.isConnected)
                {
                    MainMusic.sound.remove();
                }
            }
            BoosterSound = new Sound("Thruster",true, GameCharacter.x, GameCharacter.y);
            MainMusic = new Sound("HeartOfEternity",true, GameCharacter.x, GameCharacter.y);
            HyperspaceSound = new Sound("Hyperspace",true, GameCharacter.x, GameCharacter.y);
            BoosterSound.stop();
            AddObjStack.push(new TextTimer(100,100,"Hello","Ariel",30,"white",true,ChangeScene,"MainGame",GameTicks,30,GameContext));
            AddObjStack.push(new Text(200,300,"W: Forwards","Ariel","50px","white",GameContext));
            AddObjStack.push(new Text(600,300,"A/d: right/left","Ariel","50px","white",GameContext));
            AddObjStack.push(new Text(450,500,"P: shoot","Ariel","50px","white",GameContext));
            hyperDrive();
        }

    }
}

function playerDeath()
{
    Foreground.Visible = true;
    RestartButton.Visible = true;
    RestartText.Visible = true;
    GameObjects.push(new Text(100,250,"Crashed", "RobotInvaders","200px","red",MainGameArea.context));
}

var MainGameArea = {
    canvas : document.createElement("canvas"),
    start : function()
    {
        this.canvas.width = ScreenWidth;
        this.canvas.height = ScreenHeight;
        this.canvas.style.position = "absolute";
        this.canvas.id = "GameWindow";
        this.canvas.style.right = "0";
        this.canvas.style.left = "0";
        this.canvas.style.top = "0";
        this.canvas.style.bottom = "0";
        this.canvas.style.margin = "auto";
        let clickOffset = ScreenWidth / 2;

        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        GameContext = this.context;
        this.interval = setInterval(updateGame, TickPerSecond);

        window.addEventListener('keydown', function (event) {

            KeyPressed = event.keyCode;

            if (KeyPressed === 68)
            {
                MoveKeysPressed[1] = true;
            }
            else if (KeyPressed === 65)
            {
                MoveKeysPressed[0] = true;
            }
            else if (KeyPressed === 87)
            {

                MoveKeysPressed[2] = true;
            }
            else if (KeyPressed === 80)
            {
                let BulletAngle = GameCharacter.Rotation;
                AddObjStack.push(new Bullet(GameCharacter.x + GameCharacter.width / 2,GameCharacter.y + GameCharacter.height / 2,BulletAngle,17, 51, GameContext));
                GameSounds.push(new Sound("Shooting",false,GameCharacter.x,GameCharacter.y));
            }

        })
        window.addEventListener('keyup', function (e) {
            KeyPressed = false;
            if (e.keyCode === 68)
            {
                MoveKeysPressed[1] = false;
            }
            else if (e.keyCode === 65)
            {
                MoveKeysPressed[0] = false;
            }
            else if (e.keyCode === 87)
            {
                MoveKeysPressed[2] = false;
            }
            else if (KeyPressed === 80)
            {
                Firing = false;
            }
        })
        window.addEventListener('click', function (e) {
            Clicked = true;
        });

        window.addEventListener('mousemove', function(event) {
                let rect = document.getElementById("GameWindow").getBoundingClientRect(); // Get canvas position
                MousePosition[0] = event.clientX - rect.left;
                MousePosition[1] = event.clientY - rect.top;
                //console.log(MousePosition[0], MousePosition[1]);
        })

        //Gravity();
    },
    clear : function()
    {
        this.context.clearRect(0,0 ,this.canvas.width, this.canvas.height);
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateGame()
{
    if (AstroidsPresent < MaxAstroids && AsteroidAsset === "Asteroid" && SpawnAsteroids)
    {
        //MaxAstroids = 2
        AddObjStack.push(new Asteroid(AsteroidAsset,60,60,GameContext));
        AstroidsPresent += 1;
    }
    else if (AstroidsPresent < MaxAstroids && AsteroidAsset === "CrystalAsteroid" && SpawnAsteroids)
    {
        AddObjStack.push(new CrystalAsteroid(AsteroidAsset,60,120,GameContext));
        AstroidsPresent += 1;

    }

    MainGameArea.clear();

    if (Background instanceof BackgroundImage)
    {
        Background.update();
    }

    for (let i = 0; i < AddObjStack.length; i++)
    {
        GameObjects.push(AddObjStack.pop());
    }

    for (let i = 0; i < GameObjects.length; i++)
    {
        GameObjects[i].update();
    }

    for (let i = 0; i < GameSounds.length; i++)
    {
        GameSounds[i].update();
    }

    for (let i = 0; i < DeleteObjStack.length; i++)
    {
        GameObjects.splice(GameObjects.indexOf(DeleteObjStack.pop()),1);
    }

    if (GameCharacter instanceof Character)
    {
        HealthBar.CurrentValue = GameCharacter.Health;
        HealthBar.update();
        EngineBooster.update();
        GameCharacter.update();
        Foreground.update();
        RestartText.update();
        RestartButton.update();
    }

    //console.log(AstrCount, AstroidsPresent);
    GameTicks++;
    Clicked = false;
    //colBlock.update();
}
