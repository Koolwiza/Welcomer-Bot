const Discord = require('discord.js')
const db = require('quick.db')
const colors = require('./colors.json')
const client = new Discord.Client()



// Bot Code //

client.on('ready', () => {
    console.log(`Bot online!`) // Configure if u want
    client.user.setActivity(``, { // Some status
        type: 'WATCHING'
    })
    setInterval(() => client.user.setActivity(`devdark | ${client.users.cache.size} users`, {
        type: 'PLAYING'
    }), 1000 * 60 * 2);
})

client.on('guildMemberAdd', async member => {
    let welcomeChannel = db.fetch(`welcome_${member.guild.id}`)
    if (welcomeChannel === null) return

    let joinMsg = db.fetch(`joinmsg_${member.guild.id}`)
    if (joinMsg === null) {
        db.set(`joinmsg_${member.guild.id}`, `Welcome {member:mention}! We now have {server:members} member!`)
    }

    let newJoinMsg = db.fetch(`joinmsg_${member.guild.id}`)
    let content = newJoinMsg
        .replace(/{member:mention}/g, `<@${member.user.id}>`)
        .replace(/{member:name}/g, `${member.user.username}`)
        .replace(/{member:id}/g, `${member.user.id}`)
        .replace(/{member:tag}/g, `${member.user.tag}`)
        .replace(/{member:createdAt}/g, `${member.user.createdAt}`)
        .replace(/{server:name}/g, `${member.guild.name}`)
        .replace(/{server:members}/g, `${member.guild.members.cache.size}`)

    member.guild.channels.cache.get(welcomeChannel).send(content)
})


client.on('guildMemberRemove', async member => {
    let leaveChannel = db.fetch(`leave_${member.guild.id}`)
    if (leaveChannel === null) return

    let leaveMsg = db.fetch(`leavemsg_${member.guild.id}`)
    if (leaveMsg === null) {
        db.set(`leavemsg_${member.guild.id}`, `😢 {member:name} just left the server... We are down to {server:members} members... `)
    }

    let newJoinMsg = db.fetch(`leavemsg_${member.guild.id}`)
    let content = newJoinMsg
        .replace(/{member:mention}/g, `<@${member.user.id}>`)
        .replace(/{member:name}/g, `${member.user.username}`)
        .replace(/{member:id}/g, `${member.user.id}`)
        .replace(/{member:tag}/g, `${member.user.tag}`)
        .replace(/{member:createdAt}/g, `${member.user.createdAt}`)
        .replace(/{server:name}/g, `${member.guild.name}`)
        .replace(/{server:members}/g, `${member.guild.members.cache.size}`)

    member.guild.channels.cache.get(leaveChannel).send(content)
})

client.on('message', async message => {

    const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
    const prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : '!' // The prefix <-- This bot also supports mention prefixes ;)

    let mentionEmbed = new Discord.MessageEmbed()
        .setTimestamp()
        .setAuthor(`${message.client.user.username}`, message.client.user.avatarURL())
        .setDescription(`👋 Hey there! My prefix is ${prefix}!`)
        .setColor(colors.orange)
        .setFooter(message.client.user.username, message.client.user.displayAvatarURL({
            dynamic: true
        }))

    if (message.mentions.users.has(message.client.user.id)) message.channel.send(`<@${message.author.id}>`, mentionEmbed)

    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot || message.channel.type === "dm") return


    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();


    if (command === "emit") {
        message.client.emit(args[0], message.member)
    }

    if (command === 'leavemessage') {
        if (!args.length) {
            return message.channel.send({
                embed: {
                    title: 'Missing Arguments',
                    description: `> **Variables**
                    > **Members**
                    > \`{member:name}\` - The member's name
                    > \`{member:mention\`
                    > \`{member:tag}\`
                    > \`{member:id}\` - The member's id
                    > \`{member:createdAt}\` - When the member created his/her account
                    > \`{server:name}\` - The server's name
                    > \`{server:members}\` - The server's members
                    `,
                    fields: [{
                        name: 'Set Join Message',
                        value: '`leavemessage <joinMsg>`',
                        inline: true
                    }, {
                        name: 'Default Value',
                        value: '😢 {member:name} just left the server... We are down to {server:members} members... '
                    }, {
                        name: 'Current Value',
                        value: `\`\`\`\n${db.fetch(`leavemsg_${message.guild.id}`)}\n\`\`\``
                    }],
                    color: "BLUE"
                }
            })
        }
        let newJoinMessage = args.join(" ")
        db.fetch(`leavemsg_${message.guild.id}`)
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send({
            embed: {
                title: "Missing Permissions"
            }
        })
        let joinMsg = args.join(" ")
        db.set(`leavemsg_${message.guild.id}`, joinMsg)
        await message.channel.send({
            embed: {
                title: "Success!",
                color: "GREEN",
                description: `I have set the leave value to \`${joinMsg}\`. If you want to preview it, please emit the event!`
            }
        })
    }


    if (command === 'joinmessage') {
        if (!args.length) {
            return message.channel.send({
                embed: {
                    title: 'Missing Arguments',
                    description: `> **Variables**
                    > **Members**
                    > \`{member:name}\` - The member's name
                    > \`{member:mention\`
                    > \`{member:tag}\`
                    > \`{member:id}\` - The member's id
                    > \`{member:createdAt}\` - When the member created his/her account
                    > \`{server:name}\` - The server's name
                    > \`{server:members}\` - The server's members
                    `,
                    fields: [{
                        name: 'Set Join Message',
                        value: '`joinmessage <joinMsg>`',
                        inline: true
                    }, {
                        name: 'Default Value',
                        value: 'Welcome {member:mention}! We now have {server:members} member!'
                    }, {
                        name: 'Currect Value',
                        value: `\`\`\`\n${db.fetch(`joinmsg_${message.guild.id}`)}\n\`\`\``
                    }],
                    color: "BLUE"
                }
            })
        }
        let newJoinMessage = args.join(" ")
        db.fetch(`joinmsg_${message.guild.id}`)
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send({
            embed: {
                title: "Missing Permissions"
            }
        })
        let joinMsg = args.join(" ")
        db.set(`joinmsg_${message.guild.id}`, joinMsg)
        await message.channel.send({
            embed: {
                title: "Success!",
                color: "GREEN",
                description: `I have set the join value to \`${joinMsg}\`. If you want to preview it, please emit the event!`
            }
        })
    }

    if (command === "joinchannel") {
        let Channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(c => c.name.toLowerCase().includes(args[0]))
        if (!Channel) return message.channel.send({
            embed: {
                title: 'Missing Channel',
                description: 'Missing required arguments!',
                fields: [{
                    name: 'Usage',
                    value: '`joinchannel <channelID | channelMention | channelName>`'
                }],
                timestamp: new Date(),
                footer: {
                    text: 'Custom Bots: https://discord.gg/M4Yj2Ay!',
                    icon_url: 'https://cdn.discordapp.com/icons/746891148043354152/a_05080a5b943e5ba88fbf884406b8d59e.gif?size=512'
                },
                color: 'RED'

            }
        })
        await db.set(`welcome_${message.guild.id}`, Channel.id)
        await message.channel.send({
            embed: {
                title: 'Success!',
                description: `Join channel set as: <#${Channel.id}>! All welcome messages will be redirected here. If this was a mistake, please configure it again`,
                color: 'GREEN',
                footer: {
                    text: 'Custom Bots: https://discord.gg/M4Yj2Ay',
                    icon_url: 'https://cdn.discordapp.com/icons/746891148043354152/a_05080a5b943e5ba88fbf884406b8d59e.gif?size=512'
                },
                timestamp: new Date()
            }
        })
    }

    if (command === "leavechannel") {
        let Channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(c => c.name.toLowerCase().includes(args[0]))
        if (!Channel) return message.channel.send({
            embed: {
                title: 'Missing Channel',
                description: 'Missing required arguments!',
                fields: [{
                    name: 'Usage',
                    value: '`leavechannel <channelID | channelMention | channelName>`'
                }],
                timestamp: new Date(),
                footer: {
                    text: 'Custom Bots: https://discord.gg/M4Yj2Ay!',
                    icon_url: 'https://cdn.discordapp.com/icons/746891148043354152/a_05080a5b943e5ba88fbf884406b8d59e.gif?size=512'
                },
                color: 'RED'

            }
        })
        await db.set(`leave_${message.guild.id}`, Channel.id)
        await message.channel.send({
            embed: {
                title: 'Success!',
                description: `Leave channel set as: <#${Channel.id}>! All leave messages will be redirected here. If this was a mistake, please configure it again`,
                color: 'GREEN',
                footer: {
                    text: 'Custom Bots: https://discord.gg/M4Yj2Ay',
                    icon_url: 'https://cdn.discordapp.com/icons/746891148043354152/a_05080a5b943e5ba88fbf884406b8d59e.gif?size=512'
                },
                timestamp: new Date()
            }
        })
    }

    if (command === "cleardata") {
        if (message.member.hasPermission("ADMINISTRATOR")) {
            message.channel.send({
                embed: {
                    title: 'Clear Data',
                    description: 'Please react for what data you want to clear!',
                    color: "BLUE",
                    fields: [{
                        name: 'Welcome Channel',
                        value: 'React 🔴',
                        inline: true
                    }, {
                        name: 'Leave Channel',
                        value: 'React 🟠',
                        inline: true
                    }, {
                        name: 'Join Message',
                        value: 'React 🟡',
                        inline: true
                    }, {
                        name: 'Leave Message',
                        value: 'React 🟢',
                        inline: true
                    }, {
                        name: 'All data',
                        value: 'React ⛔',
                        inline: true
                    }],

                }
            }).then(async m => {
                await m.react('🔴')
                await m.react('🟠')
                await m.react('🟡')
                await m.react('🟢')
                await m.react('⛔')

                const filter = (reaction, user) => {
                    return ['🔴', '🟠', '🟡', '🟢', '⛔'].includes(reaction.emoji.name) && user.id === message.author.id;
                };

                m.awaitReactions(filter, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                }).then(async collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '🔴') {
                        let userReactions = (m.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id)))
                        for (const reaction of userReactions.values()) {
                            await reaction.users.remove(message.author.id);
                        }
                        await db.all().filter(d => d.ID.startsWith(`welcome_${message.guild.id}`)).forEach(d => db.delete(d.ID))
                        await message.channel.send({
                            embed: {
                                title: 'Success!',
                                description: 'I have successfully cleared all data for `welcome` channel!',
                                color: 'GREEN',

                            }
                        })
                    } else if (reaction.emoji.name === '🟠') {
                        let userReactions = (m.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id)))
                        for (const reaction of userReactions.values()) {
                            await reaction.users.remove(message.author.id);
                        }
                        await db.all().filter(d => d.ID.startsWith(`leave_${message.guild.id}`)).forEach(d => db.delete(d.ID))
                        await message.channel.send({
                            embed: {
                                title: 'Success!',
                                description: 'I have successfully cleared all data for `leave` channel!',
                                color: 'GREEN',

                            }
                        })
                    } else if (reaction.emoji.name === '🟡') {
                        let userReactions = (m.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id)))
                        for (const reaction of userReactions.values()) {
                            await reaction.users.remove(message.author.id);
                        }
                        await db.all().filter(d => d.ID.startsWith(`joinmsg_${message.guild.id}`)).forEach(d => db.delete(d.ID))
                        await message.channel.send({
                            embed: {
                                title: 'Success!',
                                description: 'I have successfully cleared all data for `join message`',
                                color: 'GREEN',

                            }
                        })
                    } else if (reaction.emoji.name === '🟢') {
                        let userReactions = (m.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id)))
                        for (const reaction of userReactions.values()) {
                            await reaction.users.remove(message.author.id);
                        }
                        await db.all().filter(d => d.ID.startsWith(`leavemsg_${message.guild.id}`)).forEach(d => db.delete(d.ID))
                        await message.channel.send({
                            embed: {
                                title: 'Success!',
                                description: 'I have successfully cleared all data for `leave msg`',
                                color: 'GREEN',

                            }
                        })
                    } else {
                        let userReactions = (m.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id)))
                        for (const reaction of userReactions.values()) {
                            await reaction.users.remove(message.author.id);
                        }
                        await message.channel.send({
                            embed: {
                                title: 'Confirmation.',
                                description: 'Are you sure you want to delete all data stored?',
                                color: 'GREEN',

                            }
                        }).then(async m => {
                            await m.react('✅')
                            await m.react('❌')

                            const filter = (reaction, user) => {
                                return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                            };

                            m.awaitReactions(filter, {
                                max: 1,
                                time: 60000,
                                errors: ['time']
                            }).then(async collected => {
                                const reaction = collected.first();

                                if (reaction.emoji.name === '✅') {
                                    let userReactions = (m.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id)))
                                    for (const reaction of userReactions.values()) {
                                        await reaction.users.remove(message.author.id);
                                    }
                                    await db.all().filter(d => d.ID.startsWith(`welcome_${message.guild.id}`)).forEach(d => db.delete(d.ID))
                                    await db.all().filter(d => d.ID.startsWith(`leave_${message.guild.id}`)).forEach(d => db.delete(d.ID))
                                    await db.all().filter(d => d.ID.startsWith(`joinmsg_${message.guild.id}`)).forEach(d => db.delete(d.ID))
                                    await db.all().filter(d => d.ID.startsWith(`leavemsg_${message.guild.id}`)).forEach(d => db.delete(d.ID))


                                    await message.channel.send({
                                        embed: {
                                            title: 'Success!',
                                            description: 'I have deleted all data stored in my databases!',
                                            color: 'GREEN',

                                        }
                                    })
                                } else {
                                    let userReactions = (m.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id)))
                                    for (const reaction of userReactions.values()) {
                                        await reaction.users.remove(message.author.id);
                                    }
                                    return message.channel.send({
                                        embed: {
                                            title: 'Data clear cancelled',
                                            description: 'The data stored in my database remain safe!',
                                            color: 'GREEN',

                                        }
                                    })
                                }
                            })
                        })
                    }

                })

            })

        }
    }

})

client.login('ODAzNjgzNDg0NTA1MDc5ODk4.YBBWkg.PS4xpMoYBELmuw7bvgbNStauO_A')
