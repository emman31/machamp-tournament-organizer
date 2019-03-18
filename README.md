# machamp-tournament-organizer
Discord bot to organize remote tournaments for Pokémon Go

Bot to organis tournaments

Public commands
	!add-ultra-friend [IngameName|DiscordUser]
	   Add an entry in UserRelationships
	   - Ask for confirmation from the other user?
	   - If the IngameNam doesn't exist, error.
	   - If a discord user is specified and the user did not set his ingame name yet, prompt them to do so (In DM)

	!set-ingame-name
	   Add en entry in User with your ingame name

Admin (specific role?) commands
	!create-tournament [NumberOfUser] [?Global]
	   An algorithm to match people that can compete together.
	   Algorithm for grouping related items: 
	   https://stackoverflow.com/questions/9918993/algorithm-for-grouping-related-items
	   https://en.wikipedia.org/wiki/Disjoint-set_data_structure
	   except, every group must contains only items related to all other items in the group.
	   - NumberOfUser must be >=8
	   - By default, select people from the same discord (Guild).
	   - All the selected people must be able to do remote PvP. (Relationships in "UserRelationship")

Guilds
id|discordId|Name

User
id|DiscordId|ingameName|GuildId

UserRelationships
UserId1|UserId2

