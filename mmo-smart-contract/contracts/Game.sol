// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MMOGame {
    struct World {
        string name; //keep track of world names
        uint256 x;
        uint256 y;
        uint256 fee;
        address worldOwner;
        uint256 playerCount;
        bool isActive; // 🆕 Track if the world is active
    }
    struct City {
        string name;
        uint256 x;
        uint256 y;
        uint256 troops; // 🆕 Troops instead of power
        uint256 food;
        address player;
        uint256 lastAttackTime;
        bool isProtected;
    }

    struct Animal {
        uint256 x;
        uint256 y;
        uint256 power;
        uint256 reward;
        uint256 level;
    }

    struct Player {
        string username;
        bool isRegistered;
    }

    address public owner;
    uint256 public totalWorlds;
    mapping(uint256 => World) public worlds;
    mapping(uint256 => mapping(address => City)) public cities;
    mapping(uint256 => Animal[]) public worldAnimals;
    mapping(uint256 => address[]) public worldPlayers;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool)))
        public occupiedPositions; // worldId => x => y => occupied
    mapping(address => Player) public players; // 🆕 Track registered players

    event WorldCreated(
        uint256 indexed worldId,
        string name,
        uint256 x,
        uint256 y,
        uint256 fee,
        address indexed owner
    );
    event PlayerRegistered(address indexed player, string username);
    event WorldPaused(uint256 indexed worldId);
    event WorldDeleted(uint256 indexed worldId);
    event WorldActivated(uint256 indexed worldId);

    event PlayerJoined(
        uint256 indexed worldId,
        address indexed player,
        uint256 cityX,
        uint256 cityY
    );
    event CityScouted(
        uint256 indexed worldId,
        address indexed player,
        uint256 troops,
        uint256 food
    );
    event CityAttacked(
        uint256 indexed worldId,
        address indexed attacker,
        address indexed defender,
        bool success
    );
    event AnimalAttacked(
        uint256 indexed worldId,
        address indexed player,
        uint256 animalIndex,
        bool success
    );

    event PeaceActivated(
        uint256 indexed worldId,
        address indexed player,
        uint256 expiresAt
    );
    event AnimalSpawned(
        uint256 indexed worldId,
        uint256 x,
        uint256 y,
        uint256 level
    );
    event FundsWithdrawn(address indexed owner, uint256 amount); // ✅ New event for withdrawals

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this.");
        _;
    }

    modifier cityExists(uint256 _worldId, address _player) {
        require(
            cities[_worldId][_player].player != address(0),
            "City does not exist."
        );
        _;
    }

    modifier worldExists(uint256 _worldId) {
        require(
            worlds[_worldId].worldOwner != address(0),
            "World does not exist."
        );
        _;
    }

    modifier worldActive(uint256 _worldId) {
        require(worlds[_worldId].isActive, "World is paused.");
        _;
    }

    modifier isRegistered() {
        require(players[msg.sender].isRegistered, "You must register first.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerUser(string memory _username) external {
        require(!players[msg.sender].isRegistered, "User already registered.");
        players[msg.sender] = Player({username: _username, isRegistered: true});
        emit PlayerRegistered(msg.sender, _username);
    }

    function createWorld(
        string memory _name,
        uint256 _x,
        uint256 _y,
        uint256 _fee
    ) external onlyOwner {
        require(_x > 0 && _y > 0, "Invalid world dimensions");

        uint256 worldId = totalWorlds++;
        worlds[worldId] = World({
            name: _name,
            x: _x,
            y: _y,
            fee: _fee,
            worldOwner: msg.sender,
            playerCount: 0,
            isActive: true // 🆕 New worlds are active by default
        });

        _spawnAnimals(worldId, _x, _y, (_x * _y) / 10);
       emit WorldCreated(worldId, _name, _x, _y, _fee, msg.sender);
    }

    function toggleWorldStatus(
        uint256 _worldId
    ) external onlyOwner worldExists(_worldId) {
        // Toggle the world's active status
        worlds[_worldId].isActive = !worlds[_worldId].isActive;

        if (worlds[_worldId].isActive) {
            emit WorldActivated(_worldId);
        } else {
            emit WorldPaused(_worldId);
        }
    }

    function deleteWorld(
        uint256 _worldId
    ) external onlyOwner worldExists(_worldId) {
        delete worlds[_worldId];
        delete worldAnimals[_worldId];
        delete worldPlayers[_worldId];

        // ❗ NEW: Clear all cities in this world
        address[] memory worldPlayersList = worldPlayers[_worldId];
        for (uint256 i = 0; i < worldPlayersList.length; i++) {
            delete cities[_worldId][worldPlayersList[i]];
        }

        // ❗ NEW: Clear occupied positions
        for (uint256 x = 0; x < worlds[_worldId].x; x++) {
            for (uint256 y = 0; y < worlds[_worldId].y; y++) {
                delete occupiedPositions[_worldId][x][y];
            }
        }

        emit WorldDeleted(_worldId);
    }

    function joinWorld(
        uint256 _worldId,
        string memory _name
    ) external payable isRegistered worldExists(_worldId) worldActive(_worldId) {
        require(msg.value >= worlds[_worldId].fee, "Insufficient fee.");
        require(
            cities[_worldId][msg.sender].player == address(0),
            "Already joined this world."
        );

        uint256 randX;
        uint256 randY;

        for (uint256 i = 0; i < 10; i++) {
            randX =
                uint256(
                    keccak256(abi.encodePacked(block.timestamp, msg.sender, i))
                ) %
                worlds[_worldId].x;
            randY =
                uint256(
                    keccak256(
                        abi.encodePacked(block.timestamp, msg.sender, i + 1)
                    )
                ) %
                worlds[_worldId].y;

            if (!occupiedPositions[_worldId][randX][randY]) {
                break;
            }
        }

        require(
            !occupiedPositions[_worldId][randX][randY],
            "Failed to find empty spot."
        );

        cities[_worldId][msg.sender] = City({
            name: _name,
            x: randX,
            y: randY,
            troops: 100, // 🆕 All players start with 100 troops
            food: 100,
            player: msg.sender,
            lastAttackTime: block.timestamp,
            isProtected: true // 🆕 New players start protected
        });

        occupiedPositions[_worldId][randX][randY] = true;
        worlds[_worldId].playerCount++;
        worldPlayers[_worldId].push(msg.sender);

        emit PlayerJoined(_worldId, msg.sender, randX, randY);

        // 🆕 Set up automatic removal of protection after 1 day
        _scheduleProtectionRemoval(_worldId, msg.sender);
    }

    function _scheduleProtectionRemoval(
        uint256 _worldId,
        address _player
    ) internal {
        // Protection lasts for 1 day (86400 seconds)
        cities[_worldId][_player].lastAttackTime = block.timestamp + 1 days;
    }

    function getWorld(
        uint256 _worldId
    ) external view returns (uint256, uint256, uint256, address, uint256) {
        require(
            worlds[_worldId].worldOwner != address(0),
            "World does not exist."
        );
        World memory world = worlds[_worldId];
        return (
            world.x,
            world.y,
            world.fee,
            world.worldOwner,
            world.playerCount
        );
    }

    function getAllWorlds() external view returns (World[] memory) {
    World[] memory worldsArray = new World[](totalWorlds);
    for (uint256 i = 0; i < totalWorlds; i++) {
        worldsArray[i] = worlds[i];
    }
    return worldsArray;
}


    function scoutCity(uint256 _worldId, address _cityOwner) external payable {
        require(msg.value >= 0.1 ether, "Scout fee is 0.1 CORE or more.");
        City memory city = cities[_worldId][_cityOwner];
        require(city.player != address(0), "City not found.");

        emit CityScouted(_worldId, msg.sender, city.troops, city.food);
    }

    function attackCity(
        uint256 _worldId,
        address _defender,
        uint256 troopsSent // 🆕 Attacker specifies troops to send
    )
        external
        cityExists(_worldId, msg.sender)
        cityExists(_worldId, _defender)
        worldActive(_worldId)
    {
        City storage attackerCity = cities[_worldId][msg.sender];
        City storage defenderCity = cities[_worldId][_defender];

        require(!defenderCity.isProtected, "City is under protection.");
        require(troopsSent > 0, "Must send troops to attack.");
        require(
            attackerCity.troops >= troopsSent,
            "Not enough troops available."
        );

        uint256 distance = _calculateDistance(
            attackerCity.x,
            attackerCity.y,
            defenderCity.x,
            defenderCity.y
        );
        uint256 travelTime = distance * 2;
        require(
            block.timestamp >= attackerCity.lastAttackTime + travelTime,
            "Wait for attack travel time."
        );

        bool success = troopsSent > defenderCity.troops;

        if (success) {
            // ✅ Attacker Wins
            uint256 stolenFood = (troopsSent * 2); // 🆕 Carrying capacity (troopsSent × 2)
            if (stolenFood > defenderCity.food) {
                stolenFood = defenderCity.food;
            }
            attackerCity.food += stolenFood;
            defenderCity.food -= stolenFood;

            // 🆕 Attacker steals **30%** of the defender’s remaining troops
            uint256 stolenTroops = (defenderCity.troops * 30) / 100;
            attackerCity.troops += stolenTroops;
            defenderCity.troops -= stolenTroops;
        } else {
            // ❌ Attacker Loses
            uint256 lossFactor = (defenderCity.troops - troopsSent) / 10;
            uint256 troopsLoss = lossFactor > 10 ? lossFactor : 10;

            // 🆕 Reduce only the **troops sent**, not entire city troops
            if (troopsSent > troopsLoss) {
                attackerCity.troops -= troopsLoss;
            } else {
                attackerCity.troops -= troopsSent; // Total loss if not enough troops
            }
        }

        // Record last attack time
        attackerCity.lastAttackTime = block.timestamp;
        emit CityAttacked(_worldId, msg.sender, _defender, success);
    }

    function attackAnimal(
        uint256 _worldId,
        uint256 _animalIndex,
        uint256 troopsSent // 🆕 Attacker specifies how many troops to send
    ) external cityExists(_worldId, msg.sender) worldActive(_worldId) {
        require(
            _animalIndex < worldAnimals[_worldId].length,
            "Invalid animal index."
        );

        City storage playerCity = cities[_worldId][msg.sender];
        Animal memory targetAnimal = worldAnimals[_worldId][_animalIndex];

        require(troopsSent > 0, "Must send troops.");
        require(
            playerCity.troops >= troopsSent,
            "Not enough troops available."
        );

        bool success = troopsSent > targetAnimal.power;

        if (success) {
            // ✅ Player wins → Earns food reward
            playerCity.food += targetAnimal.reward;

            // Remove defeated animal
            worldAnimals[_worldId][_animalIndex] = worldAnimals[_worldId][
                worldAnimals[_worldId].length - 1
            ];
            worldAnimals[_worldId].pop();

            // 🆕 Spawn a new animal
            _spawnAnimals(_worldId, worlds[_worldId].x, worlds[_worldId].y, 1);
        } else {
            // ❌ Player loses → Dynamic troop loss based on power difference
            uint256 lossFactor = (targetAnimal.power - troopsSent) / 10;
            uint256 troopsLoss = lossFactor > 10 ? lossFactor : 10;

            // 🆕 Only lose **troops sent**, not entire army
            if (troopsSent > troopsLoss) {
                playerCity.troops -= troopsLoss;
            } else {
                playerCity.troops -= troopsSent; // Total loss if not enough troops
            }
        }

        emit AnimalAttacked(_worldId, msg.sender, _animalIndex, success);
    }

    function activatePeace(
        uint256 _worldId
    ) external payable cityExists(_worldId, msg.sender) worldActive(_worldId) {
        require(msg.value >= 0.3 ether, "Peace fee is 0.3 CORE or more.");
        cities[_worldId][msg.sender].isProtected = true;

        emit PeaceActivated(_worldId, msg.sender, block.timestamp + 1 days);
    }

    function getWorldAnimals(
        uint256 _worldId
    ) external view returns (Animal[] memory) {
        return worldAnimals[_worldId];
    }

    function getPlayerPositions(
        uint256 _worldId
    )
        external
        view
        returns (address[] memory, uint256[] memory, uint256[] memory)
    {
        uint256 playerCount = worldPlayers[_worldId].length;
        address[] memory playerAddresses = new address[](playerCount);
        uint256[] memory xPositions = new uint256[](playerCount);
        uint256[] memory yPositions = new uint256[](playerCount);

        for (uint256 i = 0; i < playerCount; i++) {
            address player = worldPlayers[_worldId][i];
            playerAddresses[i] = player;
            xPositions[i] = cities[_worldId][player].x;
            yPositions[i] = cities[_worldId][player].y;
        }

        return (playerAddresses, xPositions, yPositions);
    }

    function getPlayerLocationInWorld(
        uint256 _worldId,
        address _player
    ) external view returns (uint256 x, uint256 y) {
        require(
            worlds[_worldId].worldOwner != address(0),
            "World does not exist."
        );
        require(
            cities[_worldId][_player].player != address(0),
            "Player not found in this world."
        );

        City memory playerCity = cities[_worldId][_player];
        return (playerCity.x, playerCity.y);
    }

    function _spawnAnimals(
        uint256 _worldId,
        uint256 _x,
        uint256 _y,
        uint256 numAnimals // 🆕 Allows us to spawn a custom number of animals
    ) internal {
        uint24[10] memory powerByLevel = [
            100,
            500,
            1000,
            2000,
            4500,
            8000,
            15000,
            35000,
            60000,
            100000
        ];

        for (uint256 i = 0; i < numAnimals; i++) {
            uint256 randX;
            uint256 randY;
            uint256 level;

            do {
                randX =
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                block.timestamp,
                                i,
                                block.prevrandao
                            )
                        )
                    ) %
                    _x;
                randY =
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                block.timestamp,
                                i + 1,
                                block.prevrandao
                            )
                        )
                    ) %
                    _y;
                level = _getRandomAnimalLevel();
            } while (_isPositionOccupied(_worldId, randX, randY));

            uint256 power = powerByLevel[level - 1];
            uint256 reward = power / 10;

            worldAnimals[_worldId].push(
                Animal({
                    x: randX,
                    y: randY,
                    power: power,
                    reward: reward,
                    level: level
                })
            );

            emit AnimalSpawned(_worldId, randX, randY, level);
        }
    }

    function _isPositionOccupied(
        uint256 _worldId,
        uint256 _x,
        uint256 _y
    ) internal view returns (bool) {
        for (uint256 i = 0; i < worldAnimals[_worldId].length; i++) {
            if (
                worldAnimals[_worldId][i].x == _x &&
                worldAnimals[_worldId][i].y == _y
            ) {
                return true;
            }
        }
        return false;
    }

    function _getRandomAnimalLevel() internal view returns (uint256) {
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp))) %
            1000;

        if (rand < 300) return 1;
        if (rand < 500) return 2;
        if (rand < 650) return 3;
        if (rand < 750) return 4;
        if (rand < 830) return 5;
        if (rand < 890) return 6;
        if (rand < 940) return 7;
        if (rand < 970) return 8;
        if (rand < 980) return 9;
        return 10;
    }

    function _calculateDistance(
        uint256 _x1,
        uint256 _y1,
        uint256 _x2,
        uint256 _y2
    ) internal pure returns (uint256) {
        return
            (_x1 > _x2 ? _x1 - _x2 : _x2 - _x1) +
            (_y1 > _y2 ? _y1 - _y2 : _y2 - _y1);
    }

    function toggleCityProtection(
        uint256 _worldId,
        address _player
    ) external onlyOwner {
        require(
            cities[_worldId][_player].player != address(0),
            "City does not exist."
        );

        cities[_worldId][_player].isProtected = !cities[_worldId][_player]
            .isProtected;

        emit PeaceActivated(
            _worldId,
            _player,
            cities[_worldId][_player].isProtected ? block.timestamp + 1 days : 0
        );
    }

     /** 
     * 🏆 **Withdraw Funds**
     * - Only the **contract owner** can withdraw.
     * - Prevents withdrawing **when balance is 0**.
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available for withdrawal.");

        payable(owner).transfer(balance);
        emit FundsWithdrawn(owner, balance);
    }

    /**
     * Function to check contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

}
