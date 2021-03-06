const permcheck= require('../functions/permissioncheck.js')
const modlog = require('../functions/modlog.js');
const getuid = require('../functions/getuid.js');
const canirun = require('../functions/ratelimits.js')


exports.run = async (client, message, args) => {
    var permission = permcheck(client, message, message.member, 'ban')
    if (!permission) return;

    let uid = getuid(message, args)
    let banned
    try {
        args = args.splice(1)
        console.log(args)
        myguy = await client.users.fetch(uid)
        await message.guild.fetchBan(uid)
        message.channel.send(`🚫 This user is already banned.`)
        return;
    } catch (err) {
        if (err.message == 'Unknown Ban') {
            banned = false
        } else if (err.message == 'Unknown User') {
            message.channel.send(`❓ This user does not exist.`)
            return;
        }
        else {
            console.log(err)
        }
    }

    let days = 0
    if (args[0] == '-d') {
        if (args[1] <= 7) {
            days = args[1]
            args = args.splice(2)
        } else {
            message.channel.send("❓ You can only delete up to 7 days of their message history.")
        }
    }

    bannable = await message.guild.member(uid).bannable
    if (!bannable) {
        message.channel.send(`❌ I do not have permission to ban this member.`)
        return;
    }

    let reason = args.join(' ')
    if (permcheck(client, message, message.guild.member(uid)) >= permcheck(client, message, message.member)) {
        message.channel.send("🚫 You do not have permission to ban that user.")
        return;
    }
    try {
        canirun(message, true, 'mod')
        cid = await modlog(client, message, 'Ban', uid, reason)
        await message.guild.members.ban(uid, { days: days, reason: reason})
        canirun(message, false, 'mod')
        message.channel.send(`🔨 ${cid[0]}User **${myguy.tag}** has been banned. (Case ${cid[1]})`)
    } catch (err) {
        console.log(err)
        console.log(err.messaage)
        return;
    }
}