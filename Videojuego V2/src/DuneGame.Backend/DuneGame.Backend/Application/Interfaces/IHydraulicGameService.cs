using DuneGame.Backend.Domain.Models;

namespace DuneGame.Backend.Application.Interfaces;

public interface IHydraulicGameService
{
    HydraulicConfig GetConfig();
    FullGameState GetInitialState();
    FullGameState GetCurrentState();
    ResourceState GetResources();
    PopulationState GetPopulation();
    FamilyState GetFamily();
    GovernmentState GetGovernment();
    ArmyState GetArmy();
    DiplomacyState GetDiplomacy();
    EventState GetEvents();
    PalaceState GetPalace();
    List<Building> GetBuildings();
    List<District> GetDistricts();
    bool Build(string buildingId);
    bool ProcessEventChoice(string eventId, string choiceId);
    void Tick();
}